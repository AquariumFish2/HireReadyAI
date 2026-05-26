import { SENIORITY_LEVEL } from "../constants/enums";

const jobs = [
  {
    id: 1,
    title: "Frontend Developer",
    company: "Tech Corp",
    location: "Cairo",
    type: "Full Time",
    level: SENIORITY_LEVEL.junior,
  },
  {
    id: 2,
    title: "Backend Developer",
    company: "Startup Inc",
    location: "Remote",
    type: "Part Time",
    level: SENIORITY_LEVEL.mid,
  },
  {
    id: 3,
    title: "Full Stack Engineer",
    company: "Big Tech",
    location: "Alexandria",
    type: "Full Time",
    level: SENIORITY_LEVEL.senior,
  },
];

export default jobs;
