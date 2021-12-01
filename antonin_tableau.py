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