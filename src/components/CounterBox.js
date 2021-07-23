import Counter from "./Counter";
import Box from "./ui/Box";

export function CounterBox({
  commonProps,
  counter,
  lastLabel,
  onComplete,
  onPrevious,
  siblings,
  title,
  type,
}) {
  return (
    <Box title={counter.levels[counter.stage][0]} type={type}>
      <Counter
        counter={counter}
        lastLabel={lastLabel}
        onComplete={onComplete}
        onPrevious={onPrevious}
        title={title}
        {...commonProps}
      />
      {siblings.map((counter) => (
        <Counter counter={counter} key={counter.id} {...commonProps} />
      ))}
    </Box>
  );
}
