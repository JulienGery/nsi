CHOIX = int(input("Saisir 1 pour entrer un nouveau contact, 2 pour effectuer une recherche et 0 pour quitter :\n"))
while CHOIX!=0:
    if CHOIX==1:
        nom=input("Entrer le nom correspondant et 0 pour quitter: ")
        Arsan=open('Arsan.csv','a')
        Arsan.write(" Nom : ")
        Arsan.write(nom)
        Arsan.write("\n")
        Arsan.close()
        print('Le nom a bien était enregistré')
       
    
    
        numero=input("Entrez un numéro et 0 pour quitter ")
        Arsan=open('Arsan.csv','a')
        Arsan.write(" Le numéro : ")
        Arsan.write(numero)
        Arsan.close()
        print('Numéro Enregistré')
        CHOIX=int(input("Saisir 1 pour entrer un nouveau contact, 2 pour effectuer une recherche et 0 pour quitter "))
 
    if CHOIX==2:
        recherche=input("Entrer le nom du contact et 0 pour quitter ")
        Arsan=open('Arsan.csv','r')
        for mot in Arsan:
            if recherche in mot:
                print(mot)
        Arsan.close()
        CHOIX=int(input("Saisir 1 pour entrer un nouveau contact, 2 pour effectuer une recherche et 0 pour quitter "))