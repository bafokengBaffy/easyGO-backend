import { render, screen } from '@testing-library/react';
import App from './App';

describe('App', () => {
  it('renders the landing page title', () => {
    render(<App />);

    expect(screen.getByText(/Build modern ride and fleet experiences fast./i)).toBeInTheDocument();
  });

  it('renders the navigation links', () => {
    render(<App />);

    expect(screen.getByRole('link', { name: /Home/i })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /Login/i })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /Register/i })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /Dashboard/i })).toBeInTheDocument();
  });
});
