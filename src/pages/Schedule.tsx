import React from 'react'

export default function Schedule() {
  console.log('🚨 COMPONENTE SCHEDULE RENDERIZADO!')
  console.log('🚨 ATUALIZAÇÃO FORÇADA - VERSÃO NOVA!')
  console.log('🚨 DATA:', new Date().toISOString())
  alert('COMPONENTE SCHEDULE CARREGADO!')

  return (
    <div style={{ 
      position: 'fixed',
      top: '0',
      left: '0',
      right: '0',
      bottom: '0',
      backgroundColor: 'red', 
      color: 'white',
      padding: '50px', 
      fontSize: '48px', 
      fontWeight: 'bold',
      textAlign: 'center',
      border: '20px solid yellow',
      zIndex: 10000,
      margin: '0',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      flexDirection: 'column'
    }}>
      <div>🚨 ATUALIZAÇÃO FORÇADA - PÁGINA FUNCIONANDO! 🚨</div>
      <div style={{ fontSize: '24px', marginTop: '20px' }}>
        Se você está vendo isso, o componente está funcionando!
      </div>
      <button 
        onClick={() => alert('BOTÃO FUNCIONANDO!')}
        style={{
          backgroundColor: 'blue',
          color: 'white',
          padding: '20px',
          fontSize: '24px',
          marginTop: '20px',
          border: '5px solid yellow',
          cursor: 'pointer'
        }}
      >
        🚨 BOTÃO TESTE 🚨
      </button>
    </div>
  )
}
