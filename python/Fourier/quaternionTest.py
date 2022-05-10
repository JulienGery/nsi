import bpy
import numpy as np
import mathutils
import math
#import quaternion
from typing import List

def add_cube(
    size: float = 1.0,
    location: List[float] = [0.0, 0.0, 0.0],
    rotation: List[float] = [0.0, 0.0, 0.0],
    scale: List[float] = [2.0, 2.0, 2.0]) -> None:
    bpy.ops.mesh.primitive_cube_add(
        size = size,
        calc_uvs=True,
        enter_editmode=False,
        align='WORLD',
        location = location,
        rotation = rotation,
        scale = scale,
    )

def main():
    quat_a = mathutils.Quaternion((2, 0, 4, 0))
    quat_b = mathutils.Quaternion((-0, 0, 2, 0))
    print(quat_a)
    add_cube(location=[0.0, 0.0, 0.0])
    new_cube = bpy.context.object
    new_cube.name = 'New Cube'
    new_cube.rotation_mode = 'QUATERNION'
    new_cube.rotation_quaternion = quat_a
    new_cube.keyframe_insert(data_path='rotation_quaternion', frame=1)
    new_cube.rotation_quaternion = quat_b
    new_cube.keyframe_insert(data_path='rotation_quaternion', frame=30)

main()