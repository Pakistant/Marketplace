import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import App from './App';

const mockProducts = [
  {
    id: 1,
    name: 'Miel de lavande',
    description: 'Un miel doux et floral, idéal pour accompagner le petit-déjeuner.',
    price: 4500,
    quantity: 18,
    category: 'Epicerie',
    producer_name: 'Ferme des Alpes',
    producer_city: 'Dschang',
    producer_id: 1,
  },
  {
    id: 2,
    name: 'Jus de pomme',
    description: 'Un jus pressé à froid, riche en arômes naturels.',
    price: 3200,
    quantity: 22,
    category: 'Boissons',
    producer_name: 'Verger du Soleil',
    producer_city: 'Douala',
    producer_id: 2,
  },
  {
    id: 3,
    name: 'Fromage de brebis',
    description: 'Un fromage affiné au goût délicat de lait de brebis.',
    price: 12900,
    quantity: 10,
    category: 'Fromage',
    producer_name: 'La Petite Ferme',
    producer_city: 'Garoua',
    producer_id: 3,
  },
];

describe('Boutique publique', () => {
  beforeEach(() => {
    window.localStorage.clear();
    global.fetch = jest.fn(() =>
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve(mockProducts),
      })
    );
  });

  test('affiche le catalogue avec recherche et filtre par producteur', async () => {
    render(<App />);

    expect(screen.getByRole('heading', { name: /nos produits/i })).toBeInTheDocument();

    await waitFor(() => {
      expect(screen.getByText(/miel de lavande/i)).toBeInTheDocument();
    });

    const searchInput = screen.getByPlaceholderText(/rechercher un produit/i);
    await userEvent.type(searchInput, 'miel');

    expect(screen.getByText(/miel de lavande/i)).toBeInTheDocument();
    expect(screen.queryByText(/jus de pomme/i)).not.toBeInTheDocument();
  });

  test('permet d’ajouter un produit au panier depuis la page détail', async () => {
    render(<App />);

    await waitFor(() => {
      expect(screen.getAllByRole('link', { name: /voir le produit/i }).length).toBeGreaterThan(0);
    });

    const detailLinks = screen.getAllByRole('link', { name: /voir le produit/i });
    await userEvent.click(detailLinks[0]);

    expect(screen.getByRole('heading', { name: /miel de lavande/i })).toBeInTheDocument();

    await userEvent.click(screen.getByRole('button', { name: /ajouter au panier/i }));

    expect(screen.getByText(/produit ajouté au panier/i)).toBeInTheDocument();
  });
});
