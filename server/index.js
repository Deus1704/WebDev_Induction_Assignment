const express = require("express");
const cors = require("cors");
const axios = require("axios");
const app = express();
const PORT = 8000;

app.use(cors());
app.use(express.json());

const executeCodeWithJudge0 = async (code, language, input) => {
  // Map your language to the corresponding Judge0 language ID
  let languageId;
  if (language === "py") {
    languageId = 71; // Python 3.9.9
  } else {
    // Add other languages if needed
    throw new Error("Unsupported language");
  }

  const response = await axios.post("https://api.judge0.com/submissions", {
    source_code: code,
    language_id: languageId,
    stdin: input,
  });

  const token = response.data.token;
  const result = await axios.get(`https://api.judge0.com/submissions/${token}`, {
    params: { base64_encoded: true },
  });

  return {
    output: Buffer.from(result.data.stdout, "base64").toString(),
    statusCode: result.data.status.id,
    memory: result.data.memory,
    cpuTime: result.data.time,
  };
};

app.post("/compile", async (req, res) => {
  let code = req.body.code;
  let language = req.body.language;
  let input = req.body.input;

  if (language === "python") {
    language = "py";
  }

  try {
    const result = await executeCodeWithJudge0(code, language, input);
    res.send(result);
    console.log(result);
  } catch (error) {
    console.log(error);
    res.status(500).send("Error while processing the request");
  }
});

app.listen(process.env.PORT || PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});
