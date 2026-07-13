import React from 'react';
import { View, StyleSheet } from 'react-native';
import { useTheme } from './useTheme';
import { AppText } from './AppText';

interface LineChartProps {
  data: { label: string; value: number }[];
  color: string;
  height?: number;
  unit?: string;
  min?: number;
  max?: number;
}

// Lightweight SVG-free line chart using positioned dots + connecting bars.
// Uses react-native-svg for a proper polyline.
import Svg, { Polyline, Line, Text as SvgText, Circle } from 'react-native-svg';

export function LineChart({ data, color, height = 180, unit, min, max }: LineChartProps) {
  const theme = useTheme();
  const { colors } = theme;
  const width = 320;

  if (data.length === 0) {
    return (
      <View style={[styles.empty, { height }]}>
        <AppText variant="body" color={colors.muted}>No data to chart yet.</AppText>
      </View>
    );
  }

  const values = data.map((d) => d.value);
  const lo = min ?? Math.min(...values) - 1;
  const hi = max ?? Math.max(...values) + 1;
  const range = hi - lo || 1;
  const padL = 36, padR = 12, padT = 16, padB = 28;
  const chartW = width - padL - padR;
  const chartH = height - padT - padB;

  const points = data.map((d, i) => {
    const x = padL + (data.length === 1 ? chartW / 2 : (i / (data.length - 1)) * chartW);
    const y = padT + chartH - ((d.value - lo) / range) * chartH;
    return { x, y, ...d };
  });

  const polyline = points.map((p) => `${p.x},${p.y}`).join(' ');

  // gridlines
  const gridYs = [0, 0.25, 0.5, 0.75, 1].map((f) => padT + f * chartH);
  const gridVals = gridYs.map((y) => (hi - ((y - padT) / chartH) * range).toFixed(0));

  return (
    <View style={[styles.container, { height }]}>
      <Svg width={width} height={height}>
        {gridYs.map((y, i) => (
          <Line key={i} x1={padL} y1={y} x2={width - padR} y2={y} stroke={colors.outlineVariant} strokeWidth={1} strokeDasharray="3 3" />
        ))}
        {gridVals.map((v, i) => (
          <SvgText key={i} x={padL - 6} y={gridYs[i] + 4} fontSize={9} fill={colors.muted} textAnchor="end">{v}</SvgText>
        ))}
        <Polyline points={polyline} fill="none" stroke={color} strokeWidth={2.5} strokeLinejoin="round" strokeLinecap="round" />
        {points.map((p, i) => (
          <Circle key={i} cx={p.x} cy={p.y} r={3.5} fill={color} />
        ))}
        {points.map((p, i) => (
          <SvgText key={i} x={p.x} y={height - 8} fontSize={8} fill={colors.muted} textAnchor="middle">{p.label}</SvgText>
        ))}
      </Svg>
      {unit && <AppText variant="caption" color={colors.muted} style={{ alignSelf: 'flex-end', marginRight: 12 }}>Unit: {unit}</AppText>}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { alignItems: 'center', justifyContent: 'center' },
  empty: { justifyContent: 'center', alignItems: 'center' },
});
