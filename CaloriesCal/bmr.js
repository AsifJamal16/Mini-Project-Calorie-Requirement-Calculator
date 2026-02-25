const http = require('http');
const fs = require('fs');
const path = require('path');

function activityFactorCalculation(actLevel) {
  if (actLevel === 'sedentary') {
    return 1.2;
  }
  if (actLevel === 'light') {
    return 1.375;
  }
  if (actLevel === 'moderate') {
    return 1.55;
  }
  if (actLevel === 'active') {
    return 1.725;
  }
  if (actLevel === 'veryActive') {
    return 1.9;
  }
  return 1; // default safety
}

function requestListener(req, res) {
  let url = req.url;
  let method = req.method;

  // CSS FILE
  if (url === '/index.css') {
    res.setHeader('Content-Type', 'text/css');
    fs.readFile(path.join(__dirname, 'index.css'), (err, data) => {
      if (err) {
        res.write('CSS file not found');
        res.end();
      } else {
        res.write(data);
        res.end();
      }
    });
  }

  // HOME PAGE
  else if (url === '/' || url === '/home') {
    res.setHeader('Content-Type', 'text/html');
    res.write(`
<html>
<head>
  <link rel="stylesheet" href="index.css">
</head>
<body>
  <div class="homePage">
    <h1>Calorie Requirement Calculator</h1>

    <form action="/calculate" method="POST">

      <label>Age</label><br>
      <input type="number" name="age" required><br><br>

      <label>Weight (kg)</label><br>
      <input type="number" step="0.01" name="weight" required><br><br>

      <label>Height (cm)</label><br>
      <input type="number" step="0.01" name="height" required><br><br>

      <label>Activity Level</label><br>
      <select name="activityLevel" required class='activeLevel'>
        <option value="" disabled selected>Select Activity Level</option>
        <option value="sedentary">Sedentary (little/no exercise)</option>
        <option value="light">Light (1–3 days/week)</option>
        <option value="moderate">Moderate (3–5 days/week)</option>
        <option value="active">Active (6–7 days/week)</option>
        <option value="veryActive">Very Active (hard exercise daily)</option>
      </select><br><br>

      <label>Gender</label>
      <div class="genderGroup">
        <label><input type="radio" name="gender" value="male" required class="radioClass"> Male</label>
        <label><input type="radio" name="gender" value="female" required class="radioClass"> Female</label>
      </div>

      <button type="submit" class='CalculateBMR'>Calculate</button>

    </form>
  </div>
</body>
</html>
    `);
    res.end();
  }

  // CALCULATION
  else if (url === '/calculate' && method === "POST") {

    let body = '';

    req.on('data', function (chunk) {
      body += chunk.toString();
    });

    req.on('end', function () {

      const params = new URLSearchParams(body);

      const age = Number(params.get('age'));
      const weight = Number(params.get('weight'));
      const height = Number(params.get('height'));
      const activityLevel = params.get('activityLevel');
      const gender = params.get('gender');

      let BMR;

      // Mifflin-St Jeor Formula
      if (gender === 'male') {
        BMR = (10 * weight) + (6.25 * height) - (5 * age) + 5;
      } else {
        BMR = (10 * weight) + (6.25 * height) - (5 * age) - 161;
      }

      BMR = Number(BMR.toFixed(2));

      let activityFactor = activityFactorCalculation(activityLevel);
      let dailyCalories = BMR * activityFactor;
      let toLoseWeight = dailyCalories - 500;
      let toGainWeight = dailyCalories + 500;

      dailyCalories = dailyCalories.toFixed(2);
      toLoseWeight = toLoseWeight.toFixed(2);
      toGainWeight = toGainWeight.toFixed(2);

      res.setHeader('Content-Type', 'text/html');
      res.write(`
<html>
<head>
  <link rel="stylesheet" href="index.css">
</head>
<body>
  <div class="resultPage">
    <h1>Your BMR: ${BMR}</h1>
    <h2>Daily Calories Required: ${dailyCalories}</h2>
    <h3>To Lose Weight: ${toLoseWeight} Calories/day</h3>
    <h3>To Gain Weight: ${toGainWeight} Calories/day</h3>
    <br>
    <a href="/">Go Back</a>
  </div>
</body>
</html>
      `);
      res.end();
    });
  }
}

const port = 3006;

const server = http.createServer(requestListener);

server.listen(port, function () {
  console.log(`Server running at http://localhost:${port}`);
});