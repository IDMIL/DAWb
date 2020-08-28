//Panel class. should be extended with a drawPanel method
class Panel {
  constructor(background = "white", stroke = "black", strokeWeight = 1, fill = "black",bezel =40) {
    this.background =  background;
    this.stroke = stroke;
    this.strokeWeight = strokeWeight;
    this.bezel = bezel;
    this.fill = fill;
    this.strokeClr = ["black",[28,48,65],'#B2ABF2',"blue","green"];//TODO - update these to less ugly colours
    this.xAxis= "Time";
    this.yAxis = "Amp";
    this.tickTextSize = 9;
    this.numTimeTicks = 8;
  }

  setup(p, height, width, settings) {
    this.settings = settings;
    this.buffer = p.createGraphics(width, height);
    this.buffer.strokeWeight(this.strokeWeight);
    this.buffer.background(this.background);
    this.buffer.stroke(this.stroke);
    this.buffer.fill(this.fill);
    this.buffer.textFont('Helvetica',20);
    this.buffer.textAlign(p.CENTER);

  }

  resize(h, w) {
    this.buffer.resizeCanvas(w, h);
  }

  setbackground(backgroundClr){ this.background = backgroundClr; }
  setStroke(strokeClr){ this.stroke = strokeClr; }
  setStrokeWeight(strokeWgt){ this.strokeWeight = strokeWgt; }
  setFill(fillClr){ this.fill = fillClr; }

  drawBorder(){
    let x1 = this.bezel;
    let y1 = this.bezel;
    let x2 = this.buffer.width - this.bezel;
    let y2 = this.buffer.height - this.bezel;
    this.buffer.line(x1, y1, x1, y2); // left side
    this.buffer.line(x1, y1, x2, y1); // top
    this.buffer.line(x2, y1, x2, y2); // right side
    this.buffer.line(x1, y2, x2, y2); // bottom
  }
  drawPanel(){ }

}

class freqPanel extends Panel{
  constructor(){ super(); this.xAxis = "Frequency";
  }
}

const log10 = Math.log(10);

function atodb(a, a_0 = 1)
{
  return 20 * Math.log(a / a_0) / log10;
}

function drawSignal(panel, signal, zoom = 1)
{
  let halfh = panel.buffer.height/2;
  let pixel_max = (halfh - panel.bezel - panel.tickTextSize/2);
  let pixel_per_fullscale = pixel_max * zoom;
  panel.buffer.noFill();
  panel.buffer.background(panel.background);
  panel.buffer.beginShape();
  for (let x = 0; x < panel.buffer.width - 2*panel.bezel; x++) {
    let pixel_amp = pixel_per_fullscale * signal[x];
    let y = halfh - pixel_amp;
    panel.buffer.curveVertex(x + panel.bezel, y);
  }
  panel.buffer.endShape();
  panel.buffer.line(panel.bezel, halfh, panel.buffer.width-panel.bezel, halfh);

  drawName(panel);
  drawSignalAmplitudeTicks(panel, pixel_max, 4);
  drawTimeTicks(panel, panel.numTimeTicks, 1/panel.settings.sampleRate);
  panel.drawBorder();
}

function drawDiscreteSignal(panel,signal){
  let halfh = panel.buffer.height/2;
  let gain = (halfh - panel.bezel) * 0.7;
  panel.buffer.background(panel.background);
  panel.drawBorder();
  panel.buffer.line(panel.bezel, halfh , panel.buffer.width-panel.bezel, halfh);
  let visibleSamples = Math.round((panel.buffer.width - 2 * panel.bezel)
                                  / panel.settings.downsamplingFactor);
  for (let x = 0; x < visibleSamples; x++) {
    let xpos = Math.round(panel.bezel + x * panel.settings.downsamplingFactor);
    let ypos = halfh - gain * signal[x];
    panel.buffer.line(xpos, halfh, xpos, ypos);
    panel.buffer.ellipse(xpos, ypos, panel.ellipseSize);
  }
  drawSignalAmplitudeTicks(panel, gain, 4);
  drawTimeTicks(panel, panel.numTimeTicks, 1/(panel.settings.sampleRate));
  drawName(panel);
}

function drawHorizontalTick(panel, text, height, tick_length = 5) {
  panel.buffer.fill(panel.fill);
  panel.buffer.textFont('Helvetica', panel.tickTextSize);
  panel.buffer.textAlign(panel.buffer.RIGHT);
  panel.buffer.textStyle(panel.buffer.ITALIC);
  panel.buffer.strokeWeight(0);
  panel.buffer.text(text, 0, height - panel.tickTextSize/2, panel.bezel - tick_length, height + panel.tickTextSize/2);
  panel.buffer.strokeWeight(panel.strokeWeight);
  panel.buffer.line(panel.bezel - tick_length, height, 
                    panel.bezel,               height);
}

function drawVerticalTick(panel, text, x, tick_length = 5) {
  panel.buffer.fill(panel.fill);
  panel.buffer.textFont('Helvetica', panel.tickTextSize);
  panel.buffer.textAlign(panel.buffer.CENTER);
  panel.buffer.textStyle(panel.buffer.ITALIC);
  panel.buffer.strokeWeight(0);
  // we draw the text in the center of an oversized box centered over the tick
  // 20000 pixels should be more than enough for any reasonable tick text
  panel.buffer.text(text, x - 10000, panel.buffer.height - panel.bezel + tick_length, 20000, panel.bezel);
  panel.buffer.strokeWeight(panel.strokeWeight);
  panel.buffer.line(x, panel.buffer.height - panel.bezel, 
                    x, panel.buffer.height - panel.bezel + tick_length);
}

function drawSignalAmplitudeTicks(panel, pixel_max, num_ticks) {
  let halfh = panel.buffer.height/2;

  for (let i = 1; i <= num_ticks; ++i) {
    let tick_amp_pixels = i * pixel_max / num_ticks;
    let tick_amp_db = atodb(tick_amp_pixels, pixel_max);
    drawHorizontalTick(panel, tick_amp_db.toFixed(1) + ' dB', halfh - tick_amp_pixels);
    drawHorizontalTick(panel, tick_amp_db.toFixed(1) + ' dB', halfh + tick_amp_pixels);
  }
  drawHorizontalTick(panel, '-inf dB', halfh);
}

function drawTimeTicks(panel, num_ticks, seconds_per_pixel) {
  let tick_jump = Math.floor((panel.buffer.width - 2 * panel.bezel) / num_ticks);
  for (let i = 0; i < num_ticks; ++i) {
    let x = i * tick_jump;
    let text = (x * seconds_per_pixel * 1000).toFixed(1) + ' ms';
    drawVerticalTick(panel, text, x + panel.bezel);
  }
}

function drawName(panel){
  panel.buffer.fill(panel.fill);
  panel.buffer.strokeWeight(0);
  panel.buffer.textAlign(panel.buffer.CENTER);
  panel.buffer.textStyle(panel.buffer.NORMAL);
  panel.buffer.textFont('Helvetica',15);
  let textheight = panel.buffer.textSize() + panel.buffer.textDescent() + 1;
  panel.buffer.text (panel.name, panel.bezel, panel.bezel - textheight, panel.buffer.width - 2*panel.bezel, panel.bezel);
  panel.buffer.strokeWeight(panel.strokeWeight);
}

class inputSigPanel extends Panel {
  constructor(){super(); this.name="Input Signal"}

  drawPanel(){
    drawSignal(this, this.settings.original);
  }
}

class reconstructedSigPanel extends Panel {
  constructor(){super(); this.name="Reconstructed Signal";};

  drawPanel(){
    drawSignal(this, this.settings.reconstructed);
  }
}

class inputSigFreqPanel extends freqPanel {
  constructor(){super(); this.name="Input Signal Frequency Domain";}
  drawPanel(){
    this.buffer.background(this.background);
    let halfh = (this.buffer.height)*.75;
    this.buffer.line(this.bezel, halfh, this.buffer.width-this.bezel, halfh);

  for (let x = 1; x <= this.settings.numHarm; x++) {
    let xpos = this.settings.fundFreq / 20000 * x * this.width / 2 - 1 +this.bezel;
    this.buffer.line(xpos, halfh, xpos, halfh * (1 - this.settings.amplitude * .66 / x));
  }
  let xpos = this.settings.sampleRate / 20000 * this.width / 4+this.bezel;
  this.buffer.line(this.bezel, this.bezel*2, xpos, this.bezel*2);
  this.buffer.line(xpos, this.bezel*2, xpos, halfh);

  this.drawBorder();
  drawName(this);
  }

}

function magnitude(real, cplx) {
  return Math.sqrt(real * real + cplx * cplx);
}

function drawFFT(panel, fft) {
  let base = panel.buffer.height - panel.bezel;
  let gain = (panel.buffer.height - 2 * panel.bezel);
  let offset = 100;
  let normalize = 4/fft.length;
  let xscale = (panel.buffer.width - 2*panel.bezel)/(fft.length/2);
  panel.buffer.background(panel.background);
  panel.buffer.strokeWeight(1);
  panel.buffer.stroke(panel.strokeClr[0]);
  panel.buffer.fill(panel.stroke);

  panel.buffer.beginShape();
  panel.buffer.vertex(panel.bezel, base);
  // fft.length / 2 because it is an interleaved complex array
  // with twice as many elements as it has (complex) numbers
  for (let x = 0; x <= fft.length/2; x++) {
    let xpos = xscale*x + panel.bezel;
    let ypos = base - gain * normalize * magnitude(fft[2*x], fft[2*x+1]);
    panel.buffer.vertex(xpos, ypos);
  }
  panel.buffer.vertex(panel.buffer.width - panel.bezel, base);
  panel.buffer.endShape(panel.buffer.CLOSE);
  panel.buffer.strokeWeight(panel.strokeWeight);
  panel.buffer.stroke(panel.stroke);
  panel.drawBorder();
  drawName(panel);
}

class inputSigFFTPanel extends freqPanel {
  constructor(){super(); this.name = "Input Signal FFT";}
  drawPanel() {
    drawFFT(this, this.settings.originalFreq);
    drawName(this);

  }
}

class sampledSigFFTPanel extends freqPanel {
  constructor(){super(); this.name="Reconstructed Signal FFT";}
  drawPanel() {
    drawFFT(this, this.settings.reconstructedFreq);
    drawName(this);
  }
}

class impulsePanel extends Panel {
  constructor(){
    super()
    this.strokeWeight=1;
    this.ellipseSize=5;
    this.name ="Sampling Signal";
  }
  drawPanel(){
    let base = this.buffer.height - this.bezel;
    let height = this.buffer.height * 0.35;
    this.buffer.background(this.background);
    this.drawBorder();
    this.buffer.line(this.bezel,base,this.buffer.width-this.bezel,base);

    let visibleSamples = Math.round((this.buffer.width - 2 * this.bezel)
                                    / this.settings.downsamplingFactor);
    for (let x = 0; x < visibleSamples; x++) {
      let xpos = this.bezel + x * this.settings.downsamplingFactor;
      this.buffer.line(xpos, base, xpos, height);
      this.buffer.ellipse(xpos, height, this.ellipseSize);
    }

    drawHorizontalTick(this, '0.0 dB', height);
    drawHorizontalTick(this, '-inf dB', base);
    drawTimeTicks(this, this.numTimeTicks, 1/(this.settings.sampleRate));
    drawName(this);
  }
}

class impulseFreqPanel extends freqPanel {
  constructor(){super(); this.name="Sampling Signal Frequency Domain";}
  drawPanel(){
    this.buffer.background(this.background);
    this.buffer.fill(this.fill); this.buffer.strokeWeight(this.strokeWeight);
    this.buffer.line(this.bezel, this.buffer.height*.75 , this.buffer.width-this.bezel, this.buffer.height*.75);

    for (let x = 0; x <= 4; x++) {
      let xpos = this.settings.sampleRate / 20000 * x * this.buffer.width/2+1+this.bezel;
      this.buffer.line(xpos, this.buffer.height *  .75, xpos, this.buffer.height / 4);
      if (x > 0) {
        this.buffer.text((x) + "FS", xpos-10, this.buffer.height - this.bezel*2)
      }
    }
    this.drawBorder();
    drawName(this);
  }
}

class sampledInputPanel extends Panel{
  constructor(){
    super()
    this.strokeWeight=1;
    this.ellipseSize=5;
    this.name="Sampled Signal";
  }

  drawPanel(){
    drawDiscreteSignal(this,this.settings.downsampled)
}
}

class sampledInputFreqPanel extends freqPanel{
  constructor(){ super(); this.name = "Sampled Signal Frequency Domain";}

  drawPanel(){
    let ypos = this.buffer.height * .75;
    this.buffer.background(this.background);

    for (let x = 0; x <= 4; x++) {
      let xpos = this.settings.sampleRate / 20000 * x * (this.buffer.width) / 2;
      this.buffer.stroke(this.strokeClr[x]);
      if ((xpos < this.buffer.width-this.bezel*2) &(xpos > this.bezel)){
        this.buffer.line(xpos+this.bezel, ypos, xpos+this.bezel, this.buffer.height  / 8);
        this.buffer.line(xpos+this.bezel, this.buffer.height / 8, xpos+this.bezel, this.buffer.height / 8);
        this.buffer.text((x) + "FS", xpos+this.bezel-10, this.buffer.height - this.bezel*2)

      }

    //Draw harmonics
      for (let harm = 1; harm <= this.settings.numHarm; harm++) {
        let xPositive = xpos + this.settings.fundFreq * harm * this.buffer.width / 2 / 20000+this.bezel;
        let xNegative = xpos - this.settings.fundFreq * harm * this.buffer.width / 2 / 20000+this.bezel;
        let yEnd = ypos * (1 - this.settings.amplitude * .6 / harm);
        if ((xPositive > this.bezel) & (xPositive < this.buffer.width-this.bezel)){
          this.buffer.line(xPositive, ypos, xPositive, yEnd);
        }
        if ((xNegative > this.bezel) & (xNegative < this.buffer.width-this.bezel)){
        this.buffer.line(xNegative, ypos, xNegative, yEnd);
      }
      }

    }
    this.buffer.stroke(this.stroke);
    this.buffer.line(this.bezel, ypos, this.buffer.width-this.bezel, ypos);
    this.drawBorder();
    drawName(this);
  }
}

class quantNoisePanel extends Panel{
  constructor(){
    super()
    this.strokeWeight=1;
    this.ellipseSize=5;
    this.name ="Quantization Noise";
  }
  drawPanel(){
    drawDiscreteSignal(this, this.settings.quantNoise);
  }
}
class quantNoiseFreqPanel extends Panel{
  constructor(){
    super()
    this.name ="Quantization Noise FFT";
    this.ellipseSize=2;
    this.xAxis = "Frequency";
  }
  drawPanel(){
    drawFFT(this, this.settings.quantNoiseFreq);
  }
}
