import _ from 'lodash';
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Rectangle,
  ResponsiveContainer,
  Legend
} from 'recharts';

export function SpendBarChart({ spendHistory }) {
  return (
    <ResponsiveContainer width="100%" height={400}>
      <BarChart data={spendHistory} barSize={40}>
        <XAxis dataKey="date" />
        <YAxis />
        <Tooltip
          formatter={(value, name) => [
            value.toLocaleString('en-US', { style: 'currency', currency: 'USD' }),
            _.upperFirst(name)
          ]}
        />
        <Legend formatter={value => _.upperFirst(value)} />
        <Bar
          dataKey="debit"
          fill="var(--red-400)"
          minPointSize={3}
          shape={<Rectangle radius={[4, 4, 0, 0]} />}
        />
      </BarChart>
    </ResponsiveContainer>
  );
}
