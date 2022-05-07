import csv

try :                                               #pour eviter les erreurs si le fichier n'exite pas
    with open('julienGery.csv', 'r') as f:
        repertoire = {}
        reader = csv.DictReader(f)
        for i in reader:
            values = list(i.values())               #création d'une liste [nom, numéro]
            repertoire[values[0]] =  values[1]      #ajout au dictionnaire
except:
    repertoire = {}
    
# le repertoire est construit de la manière nom: numéro

def rechercheRepertoire():
    """
    recherche un nom dans le repertoire. ne retourne rien
    """
    name = input("Entrer un nom : ")
    if name in repertoire:
        print(f"Le numéro recherché est : {repertoire[name]}")
    else:
        print('Inconnu')

def ecritRepertoire():
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
        try : 
            ch = int(input("0-quitter\n1-écrire dans le répertoire\n2-rechercher dans le répertoire\n"))
            if ch == 0:
                fieldnames = ['name', 'number']
                with open('julienGery.csv', 'w+') as f:                         #crée un ficher text julienGery pour stocker les noms et numéros de téléphone dans un fichier csv
                    writer = csv.DictWriter(f, fieldnames=fieldnames)               
                    writer.writeheader()                                        #écrit les descripteurs
                    for key, value in repertoire.items():
                        f.write(f"{key},{value}\n")                             #écrit le couple paire valeur avec la virgule comme séparateur
                exit()
            elif ch == 1:
                ecritRepertoire()
            else:
                rechercheRepertoire()
        except ValueError:
            print('saisie incorrect')

if __name__ == "__main__":                                                      #cette ligne ne sert a rien
    menu()                                                                      #lance le menu