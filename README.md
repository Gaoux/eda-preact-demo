# `create-preact`

This is a Preact App that uses Flux architecture as part of an EDA (Event-Driven Architecture) with Kafka for event streaming.

<h2 align="center">
  <img height="256" width="256" src="./src/assets/preact.svg">
</h2>

<h3 align="center">Get started using Preact and Vite!</h3>

## Getting Started

- `npm run dev` - Starts a dev server at http://localhost:5173/
- `npm run build` - Builds for production, emitting to `dist/`
- `npm run preview` - Starts a server at http://localhost:4173/ to test production build locally

## Architecture

This app follows a **Flux architecture** to manage its state. The state management system is based on **actions**, **stores**, and **dispatchers**, where events are emitted and consumed in an event-driven way.

This app is also part of an **EDA (Event-Driven Architecture)** utilizing **Kafka** for stream processing, providing robust event management and scalability.
