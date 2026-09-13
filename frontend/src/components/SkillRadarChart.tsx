import React from 'react';
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer, Tooltip, Legend } from 'recharts';

export interface Competency {
  skill: string;
  current_level: string;
  required_level: string;
  gap_analysis: string;
}

interface Props {
  data: Competency[];
}

const levelToNumber = (level: string): number => {
  const l = (level || '').toLowerCase();
  if (l.includes('expert') || l.includes('advanced')) return 4;
  if (l.includes('intermediate') || l.includes('proficient')) return 3;
  if (l.includes('beginner') || l.includes('novice')) return 2;
  return 1;
};

const SkillRadarChart: React.FC<Props> = ({ data }) => {
  if (!data || !Array.isArray(data) || data.length === 0) return null;

  const chartData = data.map((item) => {
    const skillName = item?.skill || 'Unknown Skill';
    return {
      subject: skillName.length > 15 ? skillName.substring(0, 15) + '...' : skillName,
      fullSkill: skillName,
      current: levelToNumber(item?.current_level || 'beginner'),
      required: levelToNumber(item?.required_level || 'advanced'),
      currentLevelStr: item?.current_level || 'Beginner',
      requiredLevelStr: item?.required_level || 'Advanced',
    };
  });

  return (
    <div style={{ width: '100%', height: 350 }}>
      <ResponsiveContainer width="100%" height="100%">
        <RadarChart cx="50%" cy="50%" outerRadius="70%" data={chartData}>
          <PolarGrid stroke="rgba(255,255,255,0.2)" />
          <PolarAngleAxis dataKey="subject" tick={{ fill: '#94a3b8', fontSize: 12 }} />
          <PolarRadiusAxis angle={30} domain={[0, 4]} tick={false} axisLine={false} />
          
          <Radar
            name="Current Level"
            dataKey="current"
            stroke="#3b82f6"
            fill="#3b82f6"
            fillOpacity={0.5}
          />
          <Radar
            name="Required Level"
            dataKey="required"
            stroke="#22c55e"
            fill="#22c55e"
            fillOpacity={0.5}
          />
          <Tooltip 
            contentStyle={{ backgroundColor: 'rgba(15, 23, 42, 0.9)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', color: 'white' }}
            itemStyle={{ color: '#e2e8f0' }}
            formatter={(value: any, name: any, props: any) => {
              if (name === 'Current Level') return [props?.payload?.currentLevelStr || value, name];
              if (name === 'Required Level') return [props?.payload?.requiredLevelStr || value, name];
              return [value, name];
            }}
            labelFormatter={(label: any, payload: any) => {
              if (payload && payload.length > 0 && payload[0].payload) {
                return payload[0].payload.fullSkill;
              }
              return label;
            }}
          />
          <Legend wrapperStyle={{ color: 'white', paddingTop: '10px' }}/>
        </RadarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default SkillRadarChart;
