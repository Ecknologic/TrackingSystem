import React from 'react';
import '../sass/stockCard.scss';

const StockCard = ({ title, total, icon }) => {


    return (
        <div className='stock-card'>
            <div className='image-box'>
                <img src={icon} alt='' />
            </div>
            <div className='body'>
                <div className='title'>{title}</div>
                <div className='number'>{total || 0}</div>
            </div>
        </div>
    )
}

export default StockCard