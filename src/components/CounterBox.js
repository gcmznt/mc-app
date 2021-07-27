import Counter from "./Counter";
import Box from "./ui/Box";

export function CounterBox({
  accelerators,
  commonProps,
  counter,
  lastLabel,
  onComplete,
  onPrevious,
  onStatusToggle,
  siblings,
  title,
  type,
}) {
  return (
    <Box title={counter.levels[counter.stage].name} type={type}>
      <Counter
        accelerators={accelerators}
        counter={counter}
        lastLabel={lastLabel}
        onComplete={onComplete}
        onPrevious={onPrevious}
        onStatusToggle={onStatusToggle}
        title={title}
        {...commonProps}
      />
      {siblings.map((counter) => (
        <Counter
          counter={counter}
          key={counter.id}
          title={counter.levels[counter.stage].name}
          {...commonProps}
        />
      ))}
    </Box>
  );
}
