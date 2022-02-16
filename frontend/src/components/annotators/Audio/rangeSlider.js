// import * as React from 'react';
import React, { useEffect } from 'react';
import Box from '@mui/material/Box';
import Slider from '@mui/material/Slider';


export default function RangeSlider({ maxRange, selectedRange, stepSize, setSelectedRange }) {
    const minDistance = stepSize;
    const [value, setValue] = React.useState(selectedRange);

    const handleChange = (event, newValue, activeThumb) => {
        if (!Array.isArray(newValue)) {
            return;
        }

        if (newValue[1] - newValue[0] < minDistance) {
            if (activeThumb === 0) {
                const clamped = Math.min(newValue[0], maxRange - minDistance);
                setValue([clamped, clamped + minDistance]);
                setSelectedRange(value);
            } else {
                const clamped = Math.max(newValue[1], minDistance);
                setValue([clamped - minDistance, clamped]);
                setSelectedRange(value);
            }
        } else {
            setValue(newValue);
            setSelectedRange(value);
        }
    };

    useEffect(() => {
        setValue(selectedRange);
    }, [selectedRange]);

    return (
        <Box sx={{ width: 400 }}>
            <Slider
                getAriaLabel={() => 'AudioChunk'}
                value={value}
                onChange={handleChange}
                valueLabelDisplay="auto"
                step={stepSize}
                color="primary"
                disableSwap
                max={maxRange}
            />
        </Box>
    );
}

