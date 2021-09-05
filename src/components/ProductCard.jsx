import React from "react";
import { Link } from "react-router-dom";

const ProductCard = (props) => {
  const { product, onSelect, restorationRef } = props;
  const { id, name, price, image, pageNo } = product;

  React.useEffect(() => {
    // restorationRef is only provided to the ProductCard that needs to be scrolled to
    if (!restorationRef) {
      return;
    }

    // Restoring scroll here ensures the previously selected product will always be restored, no matter how long the API request
    // to get products takes
    restorationRef.current.scrollIntoView({ behavior: 'auto', block: 'center' });
  })

  return (
    <div className="product-card" ref={restorationRef}>
      <div className="product-card__image-container">
        <Link to="/pdp" onClick={() => onSelect(id, pageNo)}>
          <img className="product-card__image" src={image} alt={name} />
        </Link>
      </div>
      <div className="product-card__name">
        <Link to="/pdp" onClick={() => onSelect(id, pageNo)}>
          {name}
        </Link>
      </div>
      <div className="product-card__price">${price}</div>
      <div className="product-card__configurations">
        <div className="product-card__configuration configuration--red" />
        <div className="product-card__configuration configuration--white" />
        <div className="product-card__configuration configuration--blue" />
        <div className="product-card__configuration configuration--green" />
        <div className="product-card__configuration configuration--yellow" />
      </div>
      <div className="product-card__configurations">
        <div className="product-card__configuration">S</div>
        <div className="product-card__configuration">M</div>
        <div className="product-card__configuration">L</div>
        <div className="product-card__configuration">XL</div>
      </div>
      <div className="product-card__action">
        <button className="product-card__action--add">Add to Cart</button>
      </div>
    </div>
  );
};

export default ProductCard;
