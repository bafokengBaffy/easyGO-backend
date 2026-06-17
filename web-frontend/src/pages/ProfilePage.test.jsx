import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import ProfilePage from './ProfilePage';

describe('ProfilePage', () => {
  it('renders the profile page title', () => {
    render(
      <BrowserRouter>
        <ProfilePage />
      </BrowserRouter>,
    );

    expect(screen.getByText(/Your profile/i)).toBeInTheDocument();
  });
});
