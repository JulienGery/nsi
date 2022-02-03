#define GREENLED 2
#define ORANGELED 3
#define REDLED 4
#define GREENBUTTON 6
#define ORANGEBUTTON 7
#define REDBUTTON 8

const int button[] = {GREENBUTTON, ORANGEBUTTON, REDBUTTON};
const int led[] = {GREENLED, ORANGELED, REDLED};
int values[50];
int inputs[3];
byte previusPin = button[0]; //defaut value

void checkPrevius(byte &pin){
  int boucle = 0;
  while(boucle<10){
    boucle++;
    if(digitalRead(pin)){
      boucle = 0;
    }
    delay(1);
  }
}

int getData(){
  checkPrevius(previusPin);
  while(true){
    for(int i = 0; i<sizeof(button)/sizeof(*button); i++){
      if(digitalRead(button[i])){
        previusPin = button[i];
        return i;
      }
    }
  }
}

void setup() {
  Serial.begin(115200);
  for(auto &i : led){
    pinMode(i, OUTPUT);
  }
  for(auto &i : button){
    pinMode(i, INPUT);
  }
}

void dis(int size){
  randomSeed(analogRead(A0));
  for(int i = 0; i<=size; i++){
    digitalWrite(led[values[i]], HIGH);
    delay(250);
    digitalWrite(led[values[i]], LOW);
    delay(250);
  }
}



void loop() {
  for(int i = 0; i<50; i++){
  values[i] = random(0,3);
  dis(i);
  for(int j = 0; j<=i; j++){
    if(values[j] != getData()){
      Serial.println("perdu");
      for(auto &k : led){
        digitalWrite(k, HIGH);
      }
      while(true){
        delay(5);
      }
    }
  }
  delay(1000);
  }
}