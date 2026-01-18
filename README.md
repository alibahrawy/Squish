# SaaS Business Calculator

A visual calculator for modeling SaaS business profitability. Adjust pricing, costs, and conversion variables to find the optimal business model.

## Features

- **Real-time calculations** - See profit/loss update instantly as you adjust variables
- **Scenario modeling** - Compare optimistic, realistic, and pessimistic scenarios
- **Visual charts** - Area charts, pie charts, and bar charts for data visualization
- **Projections table** - See profitability at different user scales
- **Infrastructure timeline** - Know when to upgrade services as you grow

## Getting Started

1. Install dependencies:
```bash
npm install
```

2. Run the development server:
```bash
npm run dev
```

3. Open [http://localhost:3000](http://localhost:3000)

## Customization

The calculator is built around these key variables:

- **Users & Conversion**: Total users, conversion rate, pro usage rate
- **Pricing**: Pro price, free credits, pro credits
- **Fixed Costs**: Development tools, domain
- **Infrastructure**: Auto-calculated based on user thresholds

Edit `lib/business-calculations.ts` to customize:
- Infrastructure cost tiers
- Service upgrade thresholds
- Projection user counts

## Tech Stack

- [Next.js 15](https://nextjs.org/)
- [React 19](https://react.dev/)
- [Tailwind CSS](https://tailwindcss.com/)
- [Recharts](https://recharts.org/)
- [Radix UI](https://www.radix-ui.com/)

## License

MIT
