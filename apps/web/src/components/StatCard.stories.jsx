import StatCard from './StatCard'

export default {
  title: 'Patterns/StatCard',
  component: StatCard,
}

export const Default = {
  args: {
    label: 'Conversion rate',
    value: '4.7×',
    sub: 'up from 1.6×',
    body: 'Average across three launch campaigns',
    chip: 'Verified',
  },
}

export const MinimalValue = {
  args: {
    label: 'Projects shipped',
    value: '12',
  },
}

export const WithTrend = {
  args: {
    label: 'Revenue lift',
    value: '+38%',
    sub: 'vs prior 6 months',
    chip: 'A/B tested',
  },
}

export const Loading = {
  render: () => (
    <div style={{ maxWidth: 280 }}>
      <StatCard label="" value="" />
    </div>
  ),
}
