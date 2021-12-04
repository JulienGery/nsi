def milieuSegment(p1 : tuple, p2 : tuple):
    return((p1[0]+p2[0])/2, (p1[1]+p2[1])/2)

def anterieur(date1 : tuple, date2 : tuple):
    if date1[0]<date2[0] and date1[1]<=date2[1] and date1[2]<=date2[2] or date1[1]<date2[1] and date1[2]<=date2[2] or  date1[2]<date2[2]:
        return True
    return False

def age(a : tuple, b : tuple):
    return a[2]-b[2]-1+anterieur((a[0], a[1], b[2]), b)

def maxi(a : tuple):
    maxi = a[0]
    for i in a:
        if i>maxi:
            maxi = i
    return maxi

def mini(a : tuple):
    mini = a[0]
    for i in a:
        if i<mini:
            mini = i
    return mini

def extremum(a : tuple):
    return (mini(a), maxi(a))

def trouve(a : tuple, b):
    for i in range(len(a)):
        if a[i] == b:
            return i
    return -1
    
 
#exercice en plus
"""
def bissextile(annee : int):
    if annee%4==0 and annee%100!=0 or annee%400==0:
        return True
    return False

def jourMois(mois : int, annee : int):
    if mois == 2:
        return 28+bissextile(annee)
    if mois in [1,3,5,7,8,10,12]:
        return 31
    return 30

def date_valid(date : tuple):
    try:
        if len(date) != 3:
            raise IndexError
        if not 1 <= date[1] <= 12:
            return f"le mois {date[1]} n'est pas valide"
        if not 1 <= date[0] <= jourMois(date[1], date[2]):
            return f"le jour {date[0]} n'est pas valide"
        return True
    except TypeError:
        return f"param given {date} is not a tuple"
    except IndexError:
        return f"tuple size invlid {date} expected 3 elements"
"""