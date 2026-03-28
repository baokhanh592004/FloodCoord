import SharedStatCard from '../shared/StatCard';

// Backward-compatible alias kept while multiple pages still import coordinator/StatCard.
export default function StatCard({ icon, count, label, color = 'blue' }) {
  return (
    <SharedStatCard
      icon={icon}
      count={count}
      label={label}
      color={color}
      variant="standard"
    />
  );
}