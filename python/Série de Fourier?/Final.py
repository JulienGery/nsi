import numpy as np
import bpy
import math

def get_grease_pencil(gpencil_obj_name='GPencil') -> bpy.types.GreasePencil:
    """
    Return the grease-pencil object with the given name. Initialize one if not already present.
    :param gpencil_obj_name: name/key of the grease pencil object in the scene
    """

    # If not present already, create grease pencil object
    if gpencil_obj_name not in bpy.context.scene.objects:
        bpy.ops.object.gpencil_add(view_align=False, location=(0, 0, 0), type='EMPTY')
        # rename grease pencil
        bpy.context.scene.objects[-1].name = gpencil_obj_name

    # Get grease pencil object
    gpencil = bpy.context.scene.objects[gpencil_obj_name]
    return gpencil


def get_grease_pencil_layer(gpencil: bpy.types.GreasePencil, gpencil_layer_name='GP_Layer',
                            clear_layer=False) -> bpy.types.GPencilLayer:
    """
    Return the grease-pencil layer with the given name. Create one if not already present.
    :param gpencil: grease-pencil object for the layer data
    :param gpencil_layer_name: name/key of the grease pencil layer
    :param clear_layer: whether to clear all previous layer data
    """

    # Get grease pencil layer or create one if none exists
    if gpencil.data.layers and gpencil_layer_name in gpencil.data.layers:
        gpencil_layer = gpencil.data.layers[gpencil_layer_name]
    else:
        gpencil_layer = gpencil.data.layers.new(gpencil_layer_name, set_active=True)

    if clear_layer:
        gpencil_layer.clear()  # clear all previous layer data

    # bpy.ops.gpencil.paintmode_toggle()  # need to trigger otherwise there is no frame

    return gpencil_layer


# Util for default behavior merging previous two methods
def init_grease_pencil(gpencil_obj_name='GPencil', gpencil_layer_name='GP_Layer',
                       clear_layer=True) -> bpy.types.GPencilLayer:
    gpencil = get_grease_pencil(gpencil_obj_name)
    gpencil_layer = get_grease_pencil_layer(gpencil, gpencil_layer_name, clear_layer=clear_layer)
    return gpencil_layer


def draw_line(gp_frame, p0: tuple, p1: tuple, color=(1, 0, 0)):
    # Init new stroke
    gp_stroke = gp_frame.strokes.new()
    
    gp_stroke.display_mode = '3DSPACE'  # allows for editing

    # Define stroke geometry
    gp_stroke.points.add(count=2)
    gp_stroke.points[0].co = p0
    gp_stroke.points[1].co = p1
    return gp_stroke


def draw_circle(gp_frame, center: tuple, radius: float, segments: int):
    # Init new stroke
    gp_stroke = gp_frame.strokes.new()
    gp_stroke.display_mode = '3DSPACE'  # allows for editing
    gp_stroke.use_cyclic = True        # closes the stroke

    # Define stroke geometry
    angle = 2*math.pi/segments  # angle in radians
    gp_stroke.points.add(count=segments)
    for i in range(segments):
        x = center[0] + radius*math.cos(angle*i)
        y = center[1] 
        z = center[2] + radius*math.sin(angle*i)
        gp_stroke.points[i].co = (x, y, z)

    return gp_stroke


nbCircle = 75 #number of circle 2nbCircle+1 computed
shape = [(i+0j) for i in np.arange(0, 50, 0.1)]+[(50+i*1j) for i in np.arange(0, 50, 0.1)]+[(i+50j) for i in np.arange(50, 0, -0.1)]+[(0+i*1j) for i in np.arange(50, -0.1, -0.1)] #2d coordinates as complex values might be evenly spaced

TCn = np.linspace(0, 1, len(shape))
Cn = [sum([shape[k]*np.exp(-n*2*np.pi*1j*TCn[k]) for k in range(len(TCn))])/len(TCn) for n in range(-nbCircle, nbCircle+1)]

dt = 0.005 #spacing between each values of Cn
T = np.arange(0, 1+dt, dt)
CnValues = [Cn[i]*np.exp((i-nbCircle)*T*2*np.pi*1j) for i in range(len(Cn))] #compute each Cn value

print(Cn)

gp_layer = init_grease_pencil()

NUM_FRAMES = len(CnValues[0])-1
FRAMES_SPACING = 1  # distance between frames
bpy.context.scene.frame_start = 0
bpy.context.scene.frame_end = NUM_FRAMES*FRAMES_SPACING

allCnSum = [sum([CnValues[i][0] for i in range(len(CnValues))])] #cumpute the 1st Cn sum

for i in range(NUM_FRAMES):
    gp_frame = gp_layer.frames.new(i)
    # [draw_line(gp_frame, (shape[j].real, 0, shape[j].imag), (shape[j+1].real, 0, shape[j+1].imag)) for j in range(len(shape)-1)]
    # break
    CnSum = 0+0j

    for k in range(len(CnValues)):
        draw_line(gp_frame, (CnSum.real, 0, CnSum.imag), (CnSum.real+CnValues[k][i].real, 0, CnSum.imag+CnValues[k][i].imag))
        draw_circle(gp_frame, (CnSum.real, 0, CnSum.imag), ((Cn[k].real)**2+(Cn[k].imag)**2)**(1/2), 50)
        CnSum += CnValues[k][i]

    allCnSum.append(CnSum)
    [draw_line(gp_frame, (allCnSum[j].real, 0, allCnSum[j].imag), (allCnSum[j+1].real, 0, allCnSum[j+1].imag)) for j in range(i)]
        