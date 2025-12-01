/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 */

import { NewAppScreen } from '@react-native/new-app-screen';
import Sound from 'react-native-sound';
import { StatusBar, StyleSheet, useColorScheme, View, Text,TouchableOpacity,Alert,Modal} from 'react-native';
import {
  SafeAreaProvider,
  useSafeAreaInsets,
} from 'react-native-safe-area-context';
import { useState } from 'react';

//notas para tania y nico , por si no entiende mis explicacion
function App() {
  const isDarkMode = useColorScheme() === 'dark';
  const filas = 12; // valor en y de cuantos niveles de cuadricula 
  const columnas = 6; // es las lineas o columnas 
  const totalCeldas = filas * columnas; // Area total del tablero 
  const [celdasReveladas, setCeldasReveladas] = useState(Array(totalCeldas).fill(false)); //Estado para mantener las celadas ocultas y poder mostrar despues
  const [juegoTerminado, setJuegoTerminado] = useState(false); //es otro estado para determinar cuando se termina el juego es decir cuando se entra en el caso de una bomba o un 1
  const [mostrarInicio,setMostrarInicio] = useState (true)
  
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
    <Modal
    animationType="slide"
      transparent={false}
      visible={mostrarInicio}
      onRequestClose={() => {
        setMostrarInicio(!mostrarInicio);
      }}
    >
    <View>
      <View>
        <Text>&#0e15d2ff BuscaMinas</Text>

        <TouchableOpacity style={styles.Botoniniciar}onPress={iniciarJuego}>
        <Text>Comenzar Juego</Text>
        </TouchableOpacity>
      </View>
    </View>
    </Modal>


    <Text style={styles.Titulo}>Buscaminas</Text>

    <View style={styles.Tabla}>
      {crearTablero()}
    </View>

    <TouchableOpacity style={styles.botonReinicio} onPress={reiniciarJuego}>
      <Text style={styles.textoBoton}>Reiniciar Juego</Text>
    </TouchableOpacity>

    <TouchableOpacity style={styles.botonRegreso}>
      <Text style={styles.textoBoton}>Regresar al menu</Text>
      
    </TouchableOpacity>

  </View>
);

}


const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  Tabla:{
    backgroundColor:"rgba(137, 221, 241, 0.47)",
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
    borderColor: '#000'
  },
  Titulo:{
    textAlign:"center",
    padding:15,
    fontSize:30,
    fontWeight:"bold",
    color:"#ffffffff"
  },
  icon:{
    textAlign:"center",
    padding:20
  },
  botonReinicio: {
    backgroundColor: '#0e15d2ff',
    padding: 10,
    marginHorizontal: 140,
    borderRadius: 5,
  },
  botonRegreso: {
    backgroundColor: '#83baf6ff',
    padding: 10,
    marginHorizontal: 140,
    borderRadius: 5,
    margin: 10
  },
    textoBoton: {
    color: 'white',
    fontWeight: 'bold',
    textAlign:'center',
    fontStyle:'italic',
  },
  Botoniniciar: {
    backgroundColor: '#3B258D',
    textAlign: 'center',
    fontFamily: 'Georgia'
  }
});

export default App;
