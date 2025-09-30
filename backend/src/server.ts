import express from "express";
import cors from "cors";
import router from "./routes/router.js";

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors({origin: [
    'http://localhost:5173',
    'https://stationenlauf.stuv-heidenheim.de'
  ]
}));
app.use(express.json());

// Attach the router
app.use("/api", router);
app.use("/api/health", (req, res) => res.send("OK"))


app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
