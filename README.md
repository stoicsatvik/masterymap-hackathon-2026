# MasteryMap

**An adaptive tutor that learns what the student knows, then chooses the next highest-value question.**

MasteryMap is a browser-based educational ML prototype built for the Prom Fall Classic. It uses Bayesian Knowledge Tracing (BKT) to maintain a latent mastery probability for each topic and an adaptive scheduler to decide what the student should answer next.

## Why this is different from a normal quiz

A fixed quiz spends questions uniformly. MasteryMap treats question selection as an information-allocation problem:

1. estimate mastery for every topic;
2. measure uncertainty in those beliefs;
3. estimate the expected information gain of another observation;
4. match question difficulty to the current mastery band; and
5. spend the next question where it is most informative.

The interface exposes the model's prior, posterior, uncertainty, expected information gain and decision trace instead of presenting an unexplained recommendation.

## Bayesian Knowledge Tracing

For a topic with current mastery probability `p`, the MVP uses:

- learning transition: `P(T) = 0.12`
- slip probability: `P(S) = 0.10`
- guess probability: `P(G) = 0.20`

For a correct response:

```text
P(L | correct) = p(1-S) / [p(1-S) + (1-p)G]
```

For an incorrect response:

```text
P(L | incorrect) = pS / [pS + (1-p)(1-G)]
```

After observing the response, the learning transition is applied:

```text
P(L_next) = posterior + (1-posterior)T
```

Question selection combines normalized mastery uncertainty `4p(1-p)`, estimated entropy reduction, difficulty match, and a novelty gate so the same question is not immediately repeated.

## Working MVP

- live per-topic mastery probabilities
- Bayesian belief update after every answer
- adaptive question selection
- easy/medium/hard question matching
- uncertainty and information-gain explanation
- visible prior → posterior update
- mastery trajectory chart
- model-decision history
- confidence capture
- accuracy and mastery-gain statistics
- downloadable session JSON
- no backend, account, API key, or paid inference required

The initial question bank covers Matrices, C Logic, Motion, and Statistics. The learning engine is domain-independent; replacing the bank does not change the BKT or scheduling logic.

## Run locally

```bash
python3 -m http.server 8080
```

Open `http://localhost:8080`.

## Architecture

```text
student response
      ↓
Bayesian Knowledge Tracing
      ↓
per-topic mastery posterior
      ↓
uncertainty + expected information gain
      ↓
difficulty-aware adaptive scheduler
      ↓
next question
      ↓
visible explanation + session trace
```

## Hackathon provenance

This public repository was created on **5 September 2026**, inside the Prom Fall Classic build window. The MasteryMap application code was written after repository creation. AI assistance was used during implementation and documentation and should remain disclosed anywhere the competition requests it.

## Prom Fall Classic alignment

The event asks for an educational tool that leverages AI/ML. MasteryMap uses an explicit probabilistic student model and adaptive decision policy rather than attaching a generic chatbot to a quiz. The intended judging story is:

- **Educational impact:** questions concentrate on uncertain knowledge states.
- **Creative AI/ML:** Bayesian mastery inference + information-driven selection.
- **Technical execution:** working end-to-end browser implementation with visible model state.
- **Pitch/demo:** every adaptive decision can be demonstrated and explained in under two minutes.

## Submission state

- [x] Public source repository
- [x] Functional adaptive-learning MVP
- [x] ML method documented
- [x] Hackathon-window provenance documented
- [ ] Automated static validation
- [ ] Public deployment
- [ ] 2-minute demo video
- [ ] Devpost registration/submission

## Responsible scope

Mastery probabilities are model estimates, not psychological diagnoses, intelligence scores, or high-stakes educational decisions. This prototype is meant for practice sequencing and transparent experimentation.
