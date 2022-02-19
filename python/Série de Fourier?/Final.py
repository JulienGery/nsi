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
shape = ['(110+25j)', '(112+50j)', '(113.5+75j)', '(115+100j)', '(116+125j)', '(117.5+150j)', '(125+150j)', '(150+150j)', '(175+150j)', '(200+150j)', '(225+150j)', '(225+175j)', '(225+200j)', '(225+220j)', '(200+220j)', '(175+220j)', '(150+220j)', '(125+220j)', '(100+220j)', '(75+220j)', '(50+220j)', '(25+220j)', '(0+219.5j)', '(-25+219j)', '(-50+217j)', '(-75+215j)', '(-100+212j)', '(-125+209j)', '(-150+203j)', '(-158+200j)', '(-175+190j)', '(-190+175j)', '(-203+150j)', '(-211+125j)', '(-220+100j)', '(-225+85j)', '(-209+85j)', '(-200+100j)', '(-182+125j)', '(-175+132j)', '(-150+145j)', '(-125+150j)', '(-100+150j)', '(-87+150j)', '(-87.5+125j)', '(-89+100j)', '(-92+75j)', '(-95+50j)', '(-100+25j)', '(-105+0j)', '(-113-25j)', '(-122-50j)', '(-136-75j)', '(-152-100j)', '(-170-125j)', '(-186-150j)', '(-189-175j)', '(-178-200j)', '(-175-205j)', '(-150-220j)', '(-125-220j)', '(-100-202j)', '(-85-175j)', '(-77-150j)', '(-73-125j)', '(-70-100j)', '(-67.5-75j)', '(-65-50j)', '(-62-25j)', '(-60+0j)', '(-57+25j)', '(-54.5+50j)', '(-51.5+75j)', '(-49+100j)', '(-47+125j)', '(-45+150j)', '(-25+150j)', '(0+150j)', '(25+150j)', '(50+150j)', '(58+150j)', '(55+125j)', '(53+100j)', '(51+75j)', '(49+50j)', '(47+25j)', '(44.5+0j)', '(42-25j)', '(40-50j)', '(38.5-75j)', '(37.5-100j)', '(37-125j)', '(37.5-150j)', '(43-175j)', '(49-185j)', '(66-200j)', '(75-205j)', '(100-215j)', '(125-218j)', '(150-214j)', '(175-203j)', '(179-200j)', '(201.5-175j)', '(213-150j)', '(221-125j)', '(226.5-100j)', '(227.5-88j)', '(210-88j)', '(209-100j)', '(200-123j)', '(197-125j)', '(175-141j)', '(150-144j)', '(125-134j)', '(117-125j)', '(109-100j)', '(106-75j)', '(106-50j)', '(110+25j)']


shape = [complex(i) for i in shape]

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
    [draw_line(gp_frame, (shape[j].real, 0, shape[j].imag), (shape[j+1].real, 0, shape[j+1].imag)) for j in range(len(shape)-1)]
    # break
    CnSum = 0+0j

    for k in range(len(CnValues)):
        draw_line(gp_frame, (CnSum.real, 0, CnSum.imag), (CnSum.real+CnValues[k][i].real, 0, CnSum.imag+CnValues[k][i].imag))
        draw_circle(gp_frame, (CnSum.real, 0, CnSum.imag), ((Cn[k].real)**2+(Cn[k].imag)**2)**(1/2), 50)
        CnSum += CnValues[k][i]

    allCnSum.append(CnSum)
    [draw_line(gp_frame, (allCnSum[j].real, 0, allCnSum[j].imag), (allCnSum[j+1].real, 0, allCnSum[j+1].imag)) for j in range(i)]
        