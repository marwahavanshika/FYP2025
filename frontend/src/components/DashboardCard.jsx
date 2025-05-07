import React from 'react';
import PropTypes from 'prop-types';

const DashboardCard = ({ title, value, icon, bgColor, textColor }) => {
  return (
    <div className={`p-6 rounded-lg shadow ${bgColor || 'bg-white'}`}>
      <div className="flex items-center">
        {icon && <div className="mr-4">{icon}</div>}
        <div>
          <h3 className="text-lg font-medium text-gray-700">{title}</h3>
          <p className={`text-3xl font-bold ${textColor || 'text-gray-900'}`}>{value}</p>
        </div>
      </div>
    </div>
  );
};

DashboardCard.propTypes = {
  title: PropTypes.string.isRequired,
  value: PropTypes.oneOfType([PropTypes.number, PropTypes.string]).isRequired,
  icon: PropTypes.element,
  bgColor: PropTypes.string,
  textColor: PropTypes.string
};

export default DashboardCard; 