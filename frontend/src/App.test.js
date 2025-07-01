import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import App from './App';

test('renders ListShare Prototype title', () => {
  render(<App />);
  expect(screen.getByText(/ListShare Prototype/i)).toBeInTheDocument();
});

test('can type in new list input', () => {
  render(<App />);
  const input = screen.getByPlaceholderText(/new list title/i);
  fireEvent.change(input, { target: { value: 'Travel' } });
  expect(input.value).toBe('Travel');
});

test('renders learn react link', () => {
  render(<App />);
  const linkElement = screen.getByText(/learn react/i);
  expect(linkElement).toBeInTheDocument();
});
