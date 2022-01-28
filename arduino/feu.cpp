#define LED_VERTE 2
#define LED_ORANGE 3
#define LED_ROUGE 4

int led[] = {LED_VERTE, LED_ORANGE, LED_ROUGE};

void setup() {
  Serial.begin(115200);
  for(auto &i  led){
    pinMode(i, OUTPUT);
  }
  Serial.println(sizeof(led));
}

void loop() {
  for(auto &i  led){
    digitalWrite(i, HIGH);
    delay(500);
    digitalWrite(i, LOW);
  }
  for(int i = (sizeof(led)sizeof(led)-1); i!=0; i--){
    digitalWrite(led[i], HIGH);
    delay(500);
    digitalWrite(led[i], LOW);
  }
}
