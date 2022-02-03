#define GREENLED 2
#define ORANGELED 3
#define REDLED 4
#define GREENBUTTON 6
#define ORANGEBUTTON 7
#define REDBUTTON 8

const int button[] = {GREENBUTTON, ORANGEBUTTON, REDBUTTON};
const int led[] = {GREENLED, ORANGELED, REDLED};
const int game_length = 50
int values[game_length];
int inputs[3];
byte previusPin = button[0]; //defaut value

void checkPrevius(byte &pin){
  int loop = 0;
  while(boucle<10){
    loop++;
    if(digitalRead(pin)){
      loop = 0;
    }
    delay(1);
  }
}

int getInput(){
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
  randomSeed(analogRead(A0));
  Serial.begin(115200);
  for(auto &i : led){
    pinMode(i, OUTPUT);
  }
  for(auto &i : button){
    pinMode(i, INPUT);
  }
}

void displaySquence(int size){
  for(int i = 0; i<=size; i++){
    digitalWrite(led[values[i]], HIGH);
    delay(250);
    digitalWrite(led[values[i]], LOW);
    delay(250);
  }
}

void loop() {
  for(int i = 0; i<game_length; i++){
  values[i] = random(0,3);
  displaySquence(i);
  for(int j = 0; j<=i; j++){
    if(values[j] != getInput()){
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