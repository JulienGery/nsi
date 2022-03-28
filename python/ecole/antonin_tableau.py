from random import randint, shuffle
 
def moyenne(a : list):
    moyenne = 0
    for i in a:
        moyenne+=i
    return moyenne/len(a)
 
def est_ordonne(a : list):
    for i in range(1, len(a)):
        if a[i-1]>a[i]:
            return False
    return True
 
def maxi(a : list):
    maxi = a[0][0]
    for i in a:
        for j in i:
            if maxi<j:
                maxi = j
    return maxi
 
tab = [
    [12, 13, 14],
    [6, 16, 18],
    [9, 14, 17]
    ]
 
def exercice4_1():
    return [0, 1, 2]

def exercice4_2(n : int):
    return [i for i in range(n)]
 
def exercice4_3(n : int):
    return [randint(1, 10) for _ in range(n)]
 
def exercice4_3b(n : int):
    tmp = [i for i in range(1, n+1)]
    shuffle(tmp)
    return tmp
 
def exercice4_4():
    return [n**2+2*n+3 for n in range(11)]
 
def exercice5_1(n : int):
    tmp = []
    [tmp.extend([1,i]) for i in range(1, n+1)]
    return tmp
 
def exercice5_2(n : int):
    return [j for i in range(1, n+1) for j in range(1, i+1)]
 
def exercice6():
    """
    lance l'exercice 6 et renvoie la liste
    """
    epicerie = [["tomates", 20], ["pommes", 10], ["carottes", 5], ["poires", 3], ["bananes", 4], ["ananas", 1]]
    tri = 2 == int(input("Tri alphanumérique (1) ou tri alphabétique (2)\n"))
    inverse = "oui" in input("tableau inversé oui/non\n")
    return sorted(epicerie, key=lambda x : x[1-tri], reverse=inverse)

 
# exercice5_2 = lambda n : [j for i in range(1, n+1) for j in range(1, i+1)]
#exercice en plus
"""
colors = ["Pique", "Coeur", "Carreau", "Trèfle"]
carteSp = ["Valet", "Dame", "Roi", "As"]

def carte_valide(carte : tuple):
    if 2<=carte[0]<=14 and carte[1] in colors:
        return True
    return False

def nom_carte(carte : tuple):
    if carte[0]<11:
        return f"{carte[0]} de {carte[1]}"
    return f"{carteSp[carte[0]-11]} de {carte[1]}"

Tcarte = [[name, color] for name in range(2, 15) for color in colors]
"""
#tester le hasard
"""
from random import random
from matplotlib.pyplot import bar, show

x, y = [x for x in range(1000)],[ y for _ in range(1000) for y in [random()]]
bar(x, y)
show()
"""
#loi normal 
"""
from random import randint
from matplotlib.pyplot import bar, show

y = [0 for i in range(13)]
for _ in range(10000):
    y[randint(1,6) + randint(1,6)] += 1

y.pop(0)
bar(range(1, len(y)+1), y)
show()
"""

#les impôts 
"""
from matplotlib.pyplot import plot, show

def tranche(a):
    if a<10000:
        return 0
    if a<25000:
        return 1
    if a<75000:
        return 2
    if a<150000:
        return 3
    return 4

tranches = [0, 11, 30, 41, 45]
revenu = int(input("tu gagnes combien ?\n"))
print(f"ton montant d'impôt est de {tranches[tranche(revenu)]/100*revenu} €\ntu es dans la tranche {tranches[tranche(revenu)]}%")

x, y = [i for i in range(0,200000, 5000)], [(tranches[tranche(i)]/100)*i for i in range(0,200000, 5000)]

plot(x, y)
show()
"""
#calcule distance 

from math import sqrt
def distance(a: tuple, b : tuple):
    return sqrt((a[0]-b[0])**2 +(a[1]-b[1])**2)

def dimension(tab : tuple):
    return (len(tab), len(tab[0]))

def longueur_dessin(tab : tuple):
    return distance((0,0), dimension(tab))

#inverse tableau*

def inverse_tableau(tab : list):
    return [tab[-i] for i in range(1, len(tab)+1)]

