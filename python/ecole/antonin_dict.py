#exercice 1 
"""
dico = {
    "Au" : {
        "Te": 2970,
        "Tf": 1063,
        "Z": 79,
        "M" : 196.967
    },
    "Ga": {
        "Te": 2237,
        "Tf": 29.8,
        "Z": 31,
        "M" : 69.72
    }
}
print(dico["Au"]["Z"])
"""
#exercice 2 
"""
scrabble = {
    "A": 1,
    "B": 3,
    "C": 3,
    "D": 2,
    "E": 1,
    "F": 4,
    "G": 2,
    "H": 4,
    "I": 1,
    "J": 8,
    "K": 5
}
somme = 0
mot = input("entez le mot en majuscule :\n")
for i in mot:
    somme += scrabble.get(i)
print(somme)
"""
#exercice 4
#question 1
panier = {
    "pomme": 1,
    "kiwi": 1,
    "banane": 1,
    "fraise": 2,
    "orange": 2,
    
}
#question 2
print(panier.get("kiwi"))
print(panier.get("fraise"))

#question 3
print(len(panier))

#question 4
print("orange" in panier)

#question 6

def est_dans_panier(panier, fruit, quantite):
    return "le fruit est dans le panier" if fruit in panier else "le fruit n'est pas dans le panier"

def ajoute_panier(panier, fruit, quantite):
    if fruit in panier:
        panier[fruit] += quantite
    else:
        panier[fruit] = quantite
    return panier
