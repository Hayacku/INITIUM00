import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Check } from 'lucide-react';
import { themes } from '../lib/themes';

const ThemePicker = ({ currentTheme, onThemeChange }) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Themes</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
          {Object.entries(themes).map(([key, theme]) => (
            <Button
              key={key}
              variant={currentTheme === key ? 'default' : 'outline'}
              onClick={() => onThemeChange(key)}
              className="flex items-center justify-between h-auto p-3"
            >
              <div className="flex items-center gap-2">
                <div
                  className="w-6 h-6 rounded-full"
                  style={{
                    background: `hsl(${theme.primary})`
                  }}
                />
                <span>{theme.name}</span>
              </div>
              {currentTheme === key && <Check className="h-4 w-4" />}
            </Button>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default ThemePicker;
