from random import randint
from os import system

couleurs = ["Pique", "Coeur", "Carreau", "Trèfle"]
valeursP = ["Valet", "Dame", "Roi", "As"]

def carte_valide(carte : tuple):
    return True if 2<=carte[0]<=14 and carte[1] in couleurs else False 
    # if 2<=carte[0]<=14 and carte[1] in couleurs:
    #     return True
    # return False

def nom_carte(carte : tuple):
    return f"{carte[0] if carte[0] <= 10 else valeursP[carte[0]-11] } de {carte[1]}" if carte_valide(carte) else "carte invalide"
    # if carte_valide(carte):
    #     if carte[0] <= 10:
    #         return f"{carte[0]} de {carte[1]}"
    #     return f"{valeursP[carte[0]-11]} de {carte[1]}"
    # return "carte invalide"

def jeu_52_carte():
    return [(i, j) for i in range(2, 15) for j in couleurs]


def melanger(tab : list):
    return [tab.pop(randint(0, len(tab)-1)) for _ in range(len(tab))]

def tirer():
    carte = melanger(jeu_52_carte())[randint(0, 51)] #pour la version sans mélange il suffit de ne pas appeler la fonction melanger
    print(nom_carte(carte))
    return carte

def duel(a, b):
    return 0 if a[0] == b[0] else 1 if a[0] > b[0] else 2
    # if a[0] == b[0]:
    #     return 0
    # if a[0] > b[0]:
    #     return 1
    # return 2

def jouer():
    nbDuel = 0
    while True:
        nbDuel += 1
        a, b = tirer(), tirer()
        if duel(a, b):
            return (duel(a, b), nbDuel)

def convertion(a :str):
    return couleurs[int(a)-1] if a.isnumeric() else a[0].capitalize()+a[1:]

def faireCarte(a = 0):
    while True:
        try:
            c = input("enter une carte valeur, couleur(valeur de 1 à 4 ou le nom)\n").replace(" ", "").split(',')
            return (int(c[0]), convertion(c[1]))
        except (ValueError, IndexError):
            if a != 0 :
                return (0, convertion('0'))
            print("saisie invalide")

print("les functions :\n1: carte valide \t 2: nom_carte \t \n3: jeu_52_carte \t 4: tirer \t\n5: mélanger \t\t 6: duel \n7: jouer")
ch = int(input())
system('cls')

if ch == 1 or ch == 2:
    while True:
        c = faireCarte(1 if ch == 1 else 0)
        print((f"la carte {nom_carte(c)} est valide" if carte_valide(c) else "la carte n'est pas valide") if ch == 1 else nom_carte(c))
        if carte_valide(c) or ch == 1: break
elif ch == 3:
    print(jeu_52_carte())
elif ch == 4:
    tirer()
elif ch == 5:
    while True:
        try:
            c = input("carte sous la forme valeur, couleur | valeur, couleur ... sinon ne rien mettre pour utiliser la totalité des cartes:\n").replace(" ", "").split("|")
            c = [(int(k), convertion(j)) for i in c for k,j in [i.split(',')]] if c != [''] else None
            [c[len(c)] for i in c if not carte_valide(i)] if c else None
            print(melanger(c) if c else melanger(jeu_52_carte()))
            break
        except (ValueError, IndexError):
            print("saisie invalide")
            continue
elif ch == 6:
    print(duel(faireCarte(), faireCarte()))
else :
    print(jouer())

