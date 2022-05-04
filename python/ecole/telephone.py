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



while True:
    ch = int(input("0-quitter\n1-écrire dans le répertoire\n2-rechercher dans le répertoire\n"))
    if ch == 0:
        exit()
    elif ch == 1:
        writeRepertoire()
    else:
        findRepertoire()
