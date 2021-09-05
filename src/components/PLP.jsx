import React from "react";
import ProductCard from "./ProductCard";
import { useInfiniteLoading } from '../hooks/useInfiniteLoading';

import { loadPage } from "../products.js";

const PLP = () => {
  const getItems = ({ page }) => {
    console.log(`API: getItems, page ${page}`);
    return new Promise((res) => {
      setTimeout(() => {
        const products = loadPage(page);
        res({ items: products, totalPages: 6 });
      }, 300);
    })
  }
  const { items, hasNext, hasPrevious, loadNext, loadPrevious, loadMoreRef } = useInfiniteLoading({ getItems, options: { loadingType: 'partial', preload: 'safe', partialInfiniteLimit: 3 } });

  if (items.length === 0) {
    return <div>Loading...</div>
  }

  return (
    <React.Fragment>
      {hasPrevious && (
        <button className="btn--load-more" type="button" onClick={() => loadPrevious()}>Load Previous</button>
      )}
      <ul className="products">
        {items.map((product) => (
          <li key={product.id}>
            <ProductCard
              product={product}
            />
          </li>
        ))}
      </ul>
      {hasNext && (
        <button ref={loadMoreRef} className="btn--load-more" type="button" onClick={() => loadNext()}>Load Next</button>
      )}
    </React.Fragment>
  );
};

export default PLP;
