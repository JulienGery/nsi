import numpy as np
import matplotlib.pyplot as plt

# combien = 75
carre = [(i+0j) for i in np.arange(0, 50, 0.1)]+[(50+i*1j) for i in np.arange(0, 50, 0.1)]+[(i+50j) for i in np.arange(50, 0, -0.1)]+[(0+i*1j) for i in np.arange(50, -0.1, -0.1)]

print(carre)
# lesT = np.linspace(0, 1, len(carre))
# juju = [sum([carre[k]*np.exp(-n*2*np.pi*1j*lesT[k]) for k in range(len(lesT))])/len(lesT) for n in range(-combien, combien+1)]

# # print(juju)
# dt = 0.001
# T = np.arange(0, 1+dt, dt)

# cercle = [1*np.exp(1j*2*np.pi*T)]

# for i in cercle:
#     print(str(i)+",", end='')