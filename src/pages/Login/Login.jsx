import React from 'react';
import LoginComponent from './LoginComponent';

const LoginPage = () => {
  return (
    <div className="min-h-screen bg-[#0A2647] flex items-center justify-center p-4 relative overflow-hidden">
      {/* Animated Background Flow */}
      <div className="absolute inset-0 overflow-hidden">
        <svg viewBox="0 0 1000 1000" xmlns="http://www.w3.org/2000/svg">
          <rect width="100%" height="100%" fill="#0A2647"/>
          <g fill="rgba(255,255,255,0.1)">
            {/* Animated Circles */}
            {[...Array(20)].map((_, index) => {
              const cx = Math.random() * 1000;
              const cy = Math.random() * 1000;
              const r = Math.random() * 2.5;
              const duration = 2 + Math.random() * 3;
              
              return (
                <circle key={index} cx={cx} cy={cy} r={r}>
                  <animateMotion 
                    path={`M 0 0 L ${Math.random() * 50 - 25} ${Math.random() * 50 - 25} L ${Math.random() * 50 - 25} 0 Z`} 
                    dur={`${duration}s`} 
                    repeatCount="indefinite"
                  />
                </circle>
              );
            })}
          </g>
        </svg>
      </div>
      
      <LoginComponent />
    </div>
  );
};

export default LoginPage;
