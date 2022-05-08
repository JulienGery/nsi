import numpy as np

A = np.array([-4, -2])
B = np.array([2, -3])
C = np.array([1, 4])
H = np.array([0, -2])

AB = B-A
BA = A-B
AC = C-A
CA = A-C
BC = C-B
CB = B-C
AH = H-A
BH = H-B
print(f"AB {AB} AC {AC} BC {BC}\nCA {CA} BA {BA} CB {CB}")
print("AB.AC =", np.dot(AC, AB))
print("BA.BC =", np.dot(BA,BC))
print("AH.AB =", np.dot(AH,AB))
print("BA.BH =", np.dot(BA, BH))