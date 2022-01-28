#define BUTTON 2

bool past = false;
int timePassed;
int timeLoop;
bool button;
bool previusButton;


void setup() {
  Serial.begin(115200);
  pinMode(BUTTON, INPUT);
}
void loop() {
  timeLoop = millis()/1000;
  button = digitalRead(BUTTON);
  if (button && previusButton == button && not past){
    Serial.println("start time");
    timePassed = millis()/1000;
    past = true;
  }else if(not button){
    past = false;
  }
  if(timeLoop-timePassed >= 2 && past){
    Serial.print("you have pressed it for ");
    Serial.print(timeLoop-timePassed);
    Serial.print(" sec.\n");
  }
  previusButton = button;
  delay(50);
}
