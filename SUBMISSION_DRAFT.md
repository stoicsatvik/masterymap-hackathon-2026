# MasteryMap — Prom Fall Classic Submission Draft

## Tagline
An adaptive tutor that estimates what you know and spends the next question where it can learn the most about your learning.

## Inspiration
Most practice systems know whether an answer was right, but not what that answer should change about the next question. A fixed worksheet gives the same sequence to everyone. MasteryMap instead maintains a probabilistic belief about each topic and continuously asks: where is the student's knowledge most uncertain, and which question would reduce that uncertainty most usefully?

## What it does
MasteryMap maintains a live mastery probability for every topic. When a student answers a question, Bayesian Knowledge Tracing updates that probability using explicit guess, slip, and learning-transition assumptions. The scheduler then compares remaining questions using mastery uncertainty, expected information gain, difficulty match, and novelty before selecting the next question.

The interface shows the model's reasoning. Students can see:

- current mastery by topic;
- why the next question was selected;
- the prior and posterior mastery estimate;
- estimated uncertainty and information gain;
- mastery trajectory over the session; and
- a complete decision trace that can be exported as JSON.

## How we built it
The MVP is a zero-backend HTML/CSS/JavaScript application. Its ML layer is Bayesian Knowledge Tracing rather than a generic chatbot API. The current parameters are `P(T)=0.12`, `P(S)=0.10`, and `P(G)=0.20`. Correct and incorrect responses update the latent mastery posterior, followed by a learning transition. Shannon entropy is used as a component of the scheduler's information-value calculation.

The question bank currently covers Matrices, C Logic, Motion, and Statistics, but the student model and scheduler are domain-independent.

## Why AI/ML is core
Without the probabilistic student model, there is no adaptive sequence. The next-question policy is a direct function of inferred mastery and uncertainty. The ML component therefore changes the application's behavior after every answer rather than merely generating text around a fixed quiz.

## Challenges
The hardest design problem was making adaptation explainable. A hidden score can feel arbitrary, so the UI exposes the probability update and selection logic. Another challenge was balancing uncertainty with difficulty. Pure uncertainty sampling can choose questions that are informative to the model but frustrating for the learner, so the scheduler also rewards questions whose difficulty matches the current mastery band.

## Accomplishments
- working Bayesian student model in the browser;
- adaptive question selection after every answer;
- visible prior → posterior belief updates;
- uncertainty and information-gain diagnostics;
- a transparent model-decision history;
- session export with full learning trace;
- no paid inference service or backend required.

## What we learned
Adaptive education is not mainly a content-generation problem. It is a sequential decision problem under uncertainty. The useful question is not "what question can AI generate?" but "what observation should the system request next, given what it currently believes?"

## What's next
1. Learn BKT parameters from real response sequences rather than keeping them fixed.
2. Add prerequisite graphs so mastery in one concept changes the value of testing another.
3. Calibrate question difficulty from observed student data.
4. Compare the adaptive scheduler against fixed-order and random-question baselines.
5. Add a teacher view for inspecting class-level misconception patterns without turning mastery estimates into high-stakes labels.
6. Support user-supplied topic banks and curriculum mappings.

## Two-minute demo plan

**0:00–0:15 — Problem**
Show that a normal quiz gives a fixed sequence. State the thesis: the next question should depend on what the system just learned about the student.

**0:15–0:45 — Live adaptation**
Answer one question correctly. Show the mastery probability jump and immediately point to the changed next-question decision.

**0:45–1:15 — Wrong answer path**
Answer another topic incorrectly. Show the posterior, explanation, and how the scheduler redirects practice toward uncertainty at an appropriate difficulty.

**1:15–1:40 — Explain the ML**
Show the BKT formula in the README and the uncertainty/information-gain panel. Emphasize that ML is controlling sequencing, not decorating a quiz with generated text.

**1:40–2:00 — Impact + next step**
Show the learning trace/export and explain the future benchmark: adaptive scheduler versus fixed/random sequencing on real student-response datasets.

## AI assistance disclosure
AI assistance was used for implementation, interface iteration, research, and documentation. The project author remains responsible for understanding, explaining, testing, and presenting the code and model assumptions.
