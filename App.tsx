/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 */

import { NewAppScreen } from '@react-native/new-app-screen';
import Sound from 'react-native-sound';
import { StatusBar, StyleSheet, useColorScheme, View, Text,TouchableOpacity,Alert,Modal,Image} from 'react-native';
import {
  SafeAreaProvider,
  useSafeAreaInsets,
} from 'react-native-safe-area-context';
import { useEffect, useState } from 'react';

//notas para tania y nico , por si no entiende mis explicacion
function App() {

  const isDarkMode = useColorScheme() === 'dark';
  const filas = 12; // valor en y de cuantos niveles de cuadricula 
  const columnas = 6; // es las lineas o columnas 
  const totalCeldas = filas * columnas; // Area total del tablero 
  const [celdasReveladas, setCeldasReveladas] = useState(Array(totalCeldas).fill(false)); //Estado para mantener las celadas ocultas y poder mostrar despues
  const [juegoTerminado, setJuegoTerminado] = useState(false); //es otro estado para determinar cuando se termina el juego es decir cuando se entra en el caso de una bomba o un 1
  const [mostrarInicio,setMostrarInicio] = useState (true)
  const [mostrarInstruccion,setMostrarInstruccion] = useState (false)
  const [mostrarNiveles,setMostrarNiveles] = useState (false)


  const totalMinas = 21;
  const totalSeguras = totalCeldas - totalMinas;


  const [JuegoGanado,setJuegoGanado] = useState(false)//se agrega esto para determinar si el jugador 
  const [contadorSegurasReveladas, setContadorSegurasReveladas] = useState(0);
  
  // ESTADO para guardar los valores de cada casilla , si es un 1 es mina, si es 0 es segura
  // usa una funcion flecha para que ejecute al instante.
  const [tablero, setTablero] = useState(() => {
    const Minas = Array(21).fill(1);// creamos un arrelgo llamdo minas para guardar tantas casillas con valor 1
    const Segura = Array(totalCeldas - 21).fill(0);// lo mismo que en minas pero con 0
    const TableroCompleto = [...Minas, ...Segura];// Ya tenemos las casillas completas falta unir ambas para tener el tablero completo
    return TableroCompleto.sort(() => Math.random() - 0.5);//antes de regresar el tablero se tiene que desordenar por eso mas sort
  });

 /////////////////////////
  const calcularBombasCercanas = (index:number) => {
  const fila = Math.floor(index / columnas);
  const columna = index % columnas;
  let bombasCercanas = 0;

  // Revisar las 8 celdas alrededor
  for (let i = -1; i <= 1; i++) {
    for (let j = -1; j <= 1; j++) {
      if (i === 0 && j === 0) continue; // Saltar la celda actual
      
      const nuevaFila = fila + i;
      const nuevaColumna = columna + j;
      
      // Verificar que no salga del tablero
      if (nuevaFila >= 0 && nuevaFila < filas && 
          nuevaColumna >= 0 && nuevaColumna < columnas) {
        
        const indiceVecino = nuevaFila * columnas + nuevaColumna;
        if (tablero[indiceVecino] === 1) {
          bombasCercanas++;
        }
      }
    }
  }
  return bombasCercanas;
};
 ////////////////////////////////



const VerificarVisctoria = (reveladas: Boolean[]) => { // Define una función llamada VerificarVictoria que toma un array de booleanos como parámetro
  let segurasReveladas = 0;

  for (let i=0; i <totalCeldas; i++){ // Itera a través de todas las celdas del tablero (de 0 a totalCeldas-1)
    if (tablero[i] === 0 && reveladas[i]){
      segurasReveladas++;
    }
  }
  setContadorSegurasReveladas(segurasReveladas)
  // Si el número de casillas seguras reveladas es igual al total de casillas seguras
  if(segurasReveladas== (totalCeldas-21)){
    setJuegoGanado(true)
    setJuegoTerminado(true);
    Alert.alert('FELICIDADES, HAS GANADO 🌠',
      '¡FELICIDADES HAS GANADO 🌟',
      [
        { 
          text: 'Jugar de nuevo', 
          onPress: () => reiniciarJuego()
        },
        { 
          text: 'Volver al menú', 
          onPress: () => {
            reiniciarJuego();
            setMostrarInicio(true);
          }
        }
      ]
    )

  }
}




 //copia la funcio de crear el tablero para refrescar las bombas y celdas seguras
const reiniciarJuego = () => {
  // Reiniciar el tablero con nuevas bombas
  const nuevoTablero = () => {
    const Minas = Array(21).fill(1);
    const Segura = Array(totalCeldas - 21).fill(0);
    const TableroCompleto = [...Minas, ...Segura];
    return TableroCompleto.sort(() => Math.random() - 0.5);
  };
  

  setTablero(nuevoTablero());
  setCeldasReveladas(Array(totalCeldas).fill(false));
  setJuegoTerminado(false);
};

const iniciarJuego = () => {
    setMostrarInicio(false); // Oculta el modal de inicio
    reiniciarJuego(); // Reinicia el juego
  };


 const crearTablero = () => {
  return tablero.map((valor, index) => {
    if (celdasReveladas[index]) {
      if (valor === 1) {
        return (
          <TouchableOpacity key={index} style={styles.Celdas}>
            <Text style={styles.icon}>💣</Text>
          </TouchableOpacity>
        );
      } else {
        const bombasCercanas = calcularBombasCercanas(index);
        return (
          <TouchableOpacity key={index} style={styles.Celdas}>
            <Text style={styles.icon}>
              {bombasCercanas > 0 ? bombasCercanas : ''}
            </Text>
          </TouchableOpacity>
        );
      }
    }

    return (
      <TouchableOpacity 
        key={index}
        style={styles.Celdas}
        onPress={() => {
          if (juegoTerminado) return;
          
          const nuevasReveladas = [...celdasReveladas];
          nuevasReveladas[index] = true;
          setCeldasReveladas(nuevasReveladas);

          if (valor === 1) {
            // Revelar todas las bombas y terminar juego
            const todasLasBombasReveladas = tablero.map((esBomba, i) => 
              esBomba === 1 ? true : celdasReveladas[i]
            );
            setCeldasReveladas(todasLasBombasReveladas);
            setJuegoTerminado(true);
            Alert.alert('¡Bomba! 💣', 'Has perdido', [
              { text: 'reiniciar', onPress: () => reiniciarJuego()
              }
            ]);
          }
        }}
        disabled={juegoTerminado} // Deshabilitar si el juego terminó
      >
        <Text style={styles.icon}>?</Text>
      </TouchableOpacity>
    );
  });
};


return (
  <View style={styles.container}>



  <Modal //aqui comienza el modal de inicio
  animationType="fade"
  transparent={false}
  visible={mostrarInicio}
  onRequestClose={() => {
    setMostrarInicio(!mostrarInicio);
  }}
>
  <View style={styles.ModalColor}>
    <View>

      <Text style={styles.Titulo}>BuscaMinas</Text>

      <Image
        source={require('./LogoMina.png')} 
        style={styles.imagen}
      />

      <TouchableOpacity style={styles.Botoniniciar} onPress={() => setMostrarInstruccion(true)}>
        <Text style={styles.textoBoton}>instrucciones</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.Botoniniciar} onPress={iniciarJuego}>
        <Text style={styles.textoBoton}>Jugar</Text>
      </TouchableOpacity>


    </View>
  </View>
</Modal> {/* ////aqui Termina el modal de inicio */}



<Modal 
  animationType="fade"
  transparent={false}
  visible={mostrarInstruccion}  // usa la variable del estado
  onRequestClose={() => {setMostrarInstruccion(!mostrarInstruccion);
  }}
>
  <View style={styles.ModalInstruccion}>
  <View style={styles.modalContainer}>
  <Text style={styles.Titulo}>Instrucciones 🚩</Text>
  <Text style={styles.indicacion}>Algunas casillas tienen un número, este número indica las minas que son en todas las casillas circundantes. Así</Text>
  <Text style={styles.indicacion}>si una casilla tiene el número 3, significa que de las ocho casillas que hay alrededor (si no es en una esquina o borde)</Text>
  <Text style={styles.indicacion}>hay 3 con minas y 5 sin minas. Si se descubre una casilla sin número indica que ninguna de las casillas vecinas tiene mina y estas se descubren automáticamente. ¡SUERTE!</Text>
  
  <TouchableOpacity style={styles.Botoniniciar} onPress={() => {setMostrarInstruccion(false);  // Cierra instrucciones
    setMostrarInicio(true);        // ✅ Abre inicio
  }}>
  <Text style={styles.textoBoton}>Regresar al Inicio </Text>
  </TouchableOpacity>
  </View>
  </View>
  </Modal>


    <Text style={styles.TituloModal}>BuscaMinas</Text>
    <View style={styles.Tabla}>
      {crearTablero()}
    </View>
    <TouchableOpacity style={styles.botonRegreso} onPress={()=> setMostrarInicio(true)}>
      <Text style={styles.textoBoton}>Regresar al menu</Text>
    </TouchableOpacity>

  </View>
);

}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor:  '#470D21',
  },
  Tabla:{
    backgroundColor:"#F9E4D4",
    flexDirection: 'row',
    flexWrap: 'wrap',
    width: 360,
    margin:20,
    marginHorizontal: 35
  },
  Celdas:{
    width: 60,
    height: 60,
    borderWidth: 1,
    borderColor: '#9C0F48',
    borderRadius: 10,
  },
  Titulo:{
    textAlign:"center",
    padding:15,
    fontSize:30,
    fontWeight:"bold",
    color:"#470D21"
  },
  icon:{
    textAlign:"center",
    padding:20
  },
  botonReinicio: {
    backgroundColor: '#9b9ef1ff',
    padding: 10,
    marginHorizontal: 140,
    borderRadius: 30,
    marginBottom: 30,
    
  },
  botonRegreso: {
    backgroundColor: '#9C0F48',
    padding: 10,
    marginHorizontal: 140,
    borderRadius: 50,
    margin: 10,
    borderColor: '#4412a9ff',
  },
    textoBoton: {
    color: 'white',
    fontWeight: 'bold',
    textAlign:'center',
    fontStyle:'italic',
    
  },
  Botoniniciar: {
    backgroundColor: '#470D21',
    textAlign: 'center',
    fontFamily: 'Georgia',
    fontSize:20,
    padding:10,
    marginHorizontal:10,
    marginVertical:10,
    borderRadius: 410,
  },
  TituloModal: {
    textAlign:"center",
    padding:5,
    fontSize:30,
    fontWeight:"bold",
    color:"#F9E4D4",
    fontFamily:'Arial',
  },
  imagen: {
    borderColor: '#3c0d73ff',
    width: 200,
    height:200,
    borderRadius: 90,
    margin: 'auto',
    padding:5,
    shadowColor:'#ee8484ff',
    shadowRadius:5,
    elevation:5,
  },
  indicacion: {
    fontFamily: 'monospace',
    fontSize: 15,
    textAlign:'center',
    color: '#7793a6ff',


  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'white', // o el color que prefieras
  },
  ModalColor: {
    flex: 1,
    backgroundColor: '#F9E4D4', // Azul claro
    justifyContent: 'center',
    alignItems: 'center',
  },
  ModalInstruccion: {
  flex: 1,
  backgroundColor: '#9C0F48', // rojo
  justifyContent: 'center',
  alignItems: 'center',
  }
});

export default App;
