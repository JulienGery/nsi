import ast

try : 
    with open('julienGery.txt', 'r') as f:
        repertoire = ast.literal_eval(f.read())
except:
    repertoire = {}
    

def findRepertoire():
    """
    recherche un nom dans le repertoire
    """
    name = input("Entrer un nom : ")
    if name in repertoire:
        print(f"Le numéro recherché est : {repertoire[name]}")
    else:
        print('Inconnu')
    return

def writeRepertoire():
    """
    écrit un nom dans le répertoire
    """
    while True:
        name = input("Nom (0 pour terminer) : ")
        if name.isnumeric():
            return
        tel = input("téléphone:\t")
        repertoire[name] = tel


def menu():
    while True:
        ch = int(input("0-quitter\n1-écrire dans le répertoire\n2-rechercher dans le répertoire\n"))
        if ch == 0:
            with open('julienGery.txt', 'w+') as f:                             #crée un ficher text julienGery pour stockés les noms et numéros de téléphone dans un fichier texte
                f.write(f"{repertoire}")
                pass
            exit()
        elif ch == 1:
            writeRepertoire()
        else:
            findRepertoire()

menu()