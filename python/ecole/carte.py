from random import randint
from os import system #Utilisé pour l’affichage.

couleurs = ["Pique", "Coeur", "Carreau", "Trèfle"]
valeursP = ["Valet", "Dame", "Roi", "As"]

#Pour une meilleure lisibilité des conditions contractées une autre forme est disponible en dessous
#Les f"strings {variable}" sont une autre écriture de "strings "+str(variable) 

def carte_valide(carte : tuple):
    return True if 2<=carte[0]<=14 and carte[1] in couleurs else False
    """
    if 2<=carte[0]<=14 and carte[1] in couleurs:
        return True
    return False
    """
def nom_carte(carte : tuple):
    return f"{carte[0] if carte[0] <= 10 else valeursP[carte[0]-11] } de {carte[1]}" if carte_valide(carte) else "carte invalide"
    """
    if carte_valide(carte):           #Vérification de la validité de la carte car sinon cela peut entrainer des problèmes 
        if carte[0] <= 10:
            return f"{carte[0]} de {carte[1]}"
        return f"{valeursP[carte[0]-11]} de {carte[1]}"
    return "carte invalide"
    """
def jeu_52_carte():
    return [(i, j) for i in range(2, 15) for j in couleurs] #Construction du tableau par compréhension


def melanger(tab : list):
    return [tab.pop(randint(0, len(tab)-1)) for _ in range(len(tab))]#.pop(index) revoie l’élément retiré du tableau à cette index. Le tiret du 8 dans le for montre que nous n’utilisons pas la variable

def tirer():
    #Si la carte est affichée depuis la fonction. Utile pour le duel
    """
    carte = melanger(jeu_52_carte())[randint(0, 51)]    #pour la version sans mélange il suffit de ne pas appeler la fonction melanger
    print(nom_carte(carte))
    return carte
    """
    #Si la carte n'est pas affichée depuis la fonction 
    return melanger(jeu_52_carte())[randint(0, 51)] #pour la version sans mélange il suffit de ne pas appeler la fonction melanger

def duel(a, b):
    return 0 if a[0] == b[0] else 1 if a[0] > b[0] else 2
    """
    if a[0] == b[0]:#Si égalité 
        return 0
    if a[0] > b[0]: #Si a gagne
        return 1
    return 2        #Si b gagne
    """
def jouer():
    nbDuel = 0                  #Variable contant le nombre de duel
    while True:
        nbDuel += 1             #Incrémentation de la variable 
        a, b = tirer(), tirer() #Tirage des cartes
        if duel(a, b):
            print(f"Le joueur {duel(a,b)} a gagné avec {nom_carte([a,b][duel(a,b)-1])} contre {nom_carte([a,b][duel(b,a)-1])} après {nbDuel} duel" if nbDuel == 1 else f"Le joueur {duel(a,b)} a gagné avec {nom_carte([a,b][duel(a,b)-1])} contre {nom_carte([a,b][duel(b,a)-1])} après {nbDuel} duels")
            #Le print est en plus.
            return (duel(a, b), nbDuel)


#Partie en plus pour tester les fonctions.
def convertion(a :str): #Fonction pour avoir la couleur de la carte
    return couleurs[int(a)-1] if a.isnumeric() else a[0].capitalize()+a[1:]

def faireCarte(a = 0):  #Fonction pour créer une carte
    while True:
        try:
            c = input("enter une carte sous la forme valeur, couleur(valeur de 1 à 4 (voir tableau) ou le nom)\n").replace(" ", "").split(',')
            return (int(c[0]), convertion(c[1])) if carte_valide((int(c[0]), convertion(c[1]))) else c[len(c)]   #Renvoie la carte
        except (ValueError, IndexError):
            if a != 0 :                  #Si la Fonction a pour but de vérifier la validité de la carte. Renvoie forcément une carte invalide
                return (0, convertion('0'))
            print("Saisie invalide")

print("les functions :\n1: carte valide \t 2: nom_carte \t \n3: jeu_52_carte \t 4: tirer \t\n5: mélanger \t\t 6: duel \n7: jouer")
ch = int(input())
system('cls') #Nettoyage de la console ! sur windows seulement

if ch == 1 or ch == 2:
    while True:
        c = faireCarte(1 if ch == 1 else 0)
        print((f"La carte {nom_carte(c)} est valide" if carte_valide(c) else "La carte n'est pas valide") if ch == 1 else nom_carte(c))
        if carte_valide(c) or ch == 1: break #Demande encore si la carte n'est pas valide ou que l'utilisateur veux afficher une carte ! condition inverse codé dans le cas présent
elif ch == 3:
    print(jeu_52_carte())
elif ch == 4:
    print(tirer()) #Retirer le print si la carte est affiché depuis la fonction 
elif ch == 5:
    while True:
        try:
            c = input("Carte sous la forme valeur, couleur | valeur, couleur ... sinon ne rien mettre pour utiliser la totalité des cartes:\n").replace(" ", "").split("|")
            c = [(int(k), convertion(j)) for i in c for k,j in [i.split(',')]] if c != [''] else None   #Création des cartes de la varible c
            [c[len(c)] for i in c if not carte_valide(i)] if c else None                                #Ligne pour créer une erreur si la carte n'est pas valide.
            print(melanger(c) if c else melanger(jeu_52_carte()))
            break
        except (ValueError, IndexError):
            print("Saisie invalide")
            continue
elif ch == 6:
    c = duel(faireCarte(), faireCarte())
    print("égalité" if c == 0 else f"le joueur {c} gagne")
else :
    print(jouer())

