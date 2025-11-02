import React, { useState, useEffect, useRef } from 'react';

const generateTrainingPlan = () => {
  const today = new Date();
  const raceDate = new Date('2025-12-31');
  const daysUntilRace = Math.ceil((raceDate - today) / (1000 * 60 * 60 * 24));
  const weeksUntilRace = Math.floor(daysUntilRace / 7);
  
  const plan = [];
  const startDistance = 2;
  const targetDistance = 6.5;
  const increment = (targetDistance - startDistance) / weeksUntilRace;
  
  for (let week = 1; week <= weeksUntilRace; week++) {
    const distance = Math.min(startDistance + (increment * week), targetDistance);
    plan.push({
      week,
      distance: distance.toFixed(1),
      sessions: week < 3 ? 3 : 4,
      description: week === weeksUntilRace ? 'Semana de carrera - reducir intensidad' : 
                   week > weeksUntilRace - 2 ? 'Semana de ajuste fino' : 'Construcción de base'
    });
  }
  
  return { plan, daysUntilRace, weeksUntilRace };
};

// Calentamiento reorganizado: primero movilidad, luego activación
const warmUpExercises = [
  { name: 'Rotación de tobillos', duration: 30, description: '30 segundos - círculos con ambos tobillos' },
  { name: 'Rotación de rodillas', duration: 30, description: '30 segundos - círculos suaves' },
  { name: 'Rotación de cadera', duration: 30, description: '30 segundos - círculos amplios' },
  { name: 'Círculos de brazos', duration: 30, description: '30 segundos - adelante y atrás' },
  { name: 'Estiramiento de cuádriceps', duration: 30, description: '30 segundos - mantener cada pierna' },
  { name: 'Estiramiento de gemelos', duration: 30, description: '30 segundos - ambas piernas' },
  { name: 'Caminar ligero', duration: 120, description: '2 minutos caminando a paso ligero' },
  { name: 'Elevación de rodillas', duration: 45, description: '45 segundos - marcha en el sitio' },
  { name: 'Talones al glúteo', duration: 45, description: '45 segundos - alternando piernas' },
  { name: 'Zancadas dinámicas', duration: 60, description: '1 minuto - 10 repeticiones' },
  { name: 'Trote suave', duration: 180, description: '3 minutos a ritmo muy suave' }
];

const SanSilvestreApp = () => {
  const [screen, setScreen] = useState('home');
  const [warmUpIndex, setWarmUpIndex] = useState(0);
  const [warmUpTimer, setWarmUpTimer] = useState(0);
  const [isWarmUpActive, setIsWarmUpActive] = useState(false);
  
  const [isRunning, setIsRunning] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [runTime, setRunTime] = useState(0);
  const [distance, setDistance] = useState(0);
  const [currentPace, setCurrentPace] = useState(0);
  const [avgPace, setAvgPace] = useState(0);
  const [coordinates, setCoordinates] = useState([]);
  const [currentSpeed, setCurrentSpeed] = useState(0);
  const [maxSpeed, setMaxSpeed] = useState(0);
  const [calories, setCalories] = useState(0);
  
  // Para mostrar el resumen final
  const [finalSummary, setFinalSummary] = useState(null);
  
  const watchIdRef = useRef(null);
  const lastPositionRef = useRef(null);
  const runIntervalRef = useRef(null);
  const lastUpdateTimeRef = useRef(Date.now());
  
  const { plan, daysUntilRace, weeksUntilRace } = generateTrainingPlan();
  const currentWeek = plan[Math.min(plan.length - 1, Math.floor((plan.length - weeksUntilRace)))];

  // Timer de calentamiento
  useEffect(() => {
    let interval;
    if (isWarmUpActive && warmUpTimer > 0) {
      interval = setInterval(() => {
        setWarmUpTimer(prev => {
          if (prev <= 1) {
            setIsWarmUpActive(false);
            if (warmUpIndex < warmUpExercises.length - 1) {
              setWarmUpIndex(warmUpIndex + 1);
              setWarmUpTimer(warmUpExercises[warmUpIndex + 1].duration);
              setIsWarmUpActive(true);
            }
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isWarmUpActive, warmUpTimer, warmUpIndex]);

  // GPS tracking mejorado con actualizaciones más frecuentes
  useEffect(() => {
    if (isRunning && !isPaused) {
      if ('geolocation' in navigator) {
        watchIdRef.current = navigator.geolocation.watchPosition(
          (position) => {
            const { latitude, longitude, speed, accuracy } = position.coords;
            const now = Date.now();
            
            // Solo procesar si la precisión es aceptable (menos de 50 metros)
            if (accuracy > 50) return;
            
            const newCoord = { 
              lat: latitude, 
              lng: longitude, 
              timestamp: now,
              speed: speed,
              accuracy: accuracy
            };
            
            setCoordinates(prev => [...prev, newCoord]);
            
            // Calcular distancia incremental
            if (lastPositionRef.current) {
              const timeDiff = (now - lastUpdateTimeRef.current) / 1000; // segundos
              
              // Solo calcular si han pasado al menos 2 segundos
              if (timeDiff >= 2) {
                const dist = calculateDistance(
                  lastPositionRef.current.lat,
                  lastPositionRef.current.lng,
                  latitude,
                  longitude
                );
                
                // Filtrar distancias irreales (más de 100m en 2 segundos = 180 km/h)
                if (dist < 0.1) {
                  setDistance(prev => prev + dist);
                  lastUpdateTimeRef.current = now;
                }
              }
            }
            
            lastPositionRef.current = newCoord;
            
            // Velocidad instantánea en km/h
            if (speed !== null && speed >= 0) {
              const speedKmh = speed * 3.6;
              setCurrentSpeed(speedKmh);
              setMaxSpeed(prev => Math.max(prev, speedKmh));
            }
          },
          (error) => console.error('GPS Error:', error),
          { 
            enableHighAccuracy: true, 
            maximumAge: 1000, 
            timeout: 5000 
          }
        );
      }
      
      // Timer del cronómetro
      runIntervalRef.current = setInterval(() => {
        setRunTime(prev => prev + 1);
      }, 1000);
    } else if (isPaused) {
      // Pausar GPS pero mantener datos
      if (watchIdRef.current) {
        navigator.geolocation.clearWatch(watchIdRef.current);
        watchIdRef.current = null;
      }
    }
    
    return () => {
      if (watchIdRef.current) {
        navigator.geolocation.clearWatch(watchIdRef.current);
      }
      if (runIntervalRef.current) {
        clearInterval(runIntervalRef.current);
      }
    };
  }, [isRunning, isPaused]);

  // Calcular ritmo y calorías en tiempo real
  useEffect(() => {
    if (distance > 0 && runTime > 0) {
      const timeInMinutes = runTime / 60;
      const paceMinPerKm = timeInMinutes / distance;
      setAvgPace(paceMinPerKm);
      
      // Calcular ritmo actual (último kilómetro)
      if (coordinates.length > 1) {
        const last30Seconds = coordinates.filter(
          c => Date.now() - c.timestamp < 30000
        );
        
        if (last30Seconds.length > 1) {
          const recentDist = last30Seconds.reduce((acc, coord, idx) => {
            if (idx === 0) return 0;
            return acc + calculateDistance(
              last30Seconds[idx - 1].lat,
              last30Seconds[idx - 1].lng,
              coord.lat,
              coord.lng
            );
          }, 0);
          
          const recentTime = (last30Seconds[last30Seconds.length - 1].timestamp - last30Seconds[0].timestamp) / 1000 / 60;
          
          if (recentDist > 0 && recentTime > 0) {
            setCurrentPace(recentTime / recentDist);
          }
        }
      }
      
      // Estimación de calorías (aproximado: 60 kcal por km para persona promedio)
      setCalories(Math.round(distance * 60));
    }
  }, [distance, runTime, coordinates]);

  const calculateDistance = (lat1, lon1, lat2, lon2) => {
    const R = 6371;
    const dLat = toRad(lat2 - lat1);
    const dLon = toRad(lon2 - lon1);
    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
              Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) *
              Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  };

  const toRad = (deg) => deg * (Math.PI / 180);

  const formatTime = (seconds) => {
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return hrs > 0 
      ? `${hrs}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
      : `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const formatPace = (pace) => {
    if (!pace || pace === Infinity || pace < 0) return '--:--';
    const mins = Math.floor(pace);
    const secs = Math.floor((pace - mins) * 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const startWarmUp = () => {
    setScreen('warmup');
    setWarmUpIndex(0);
    setWarmUpTimer(warmUpExercises[0].duration);
    setIsWarmUpActive(true);
  };

  const skipWarmUp = () => {
    setScreen('running');
    setIsRunning(true);
    setIsPaused(false);
  };

  const finishWarmUp = () => {
    setScreen('running');
    setIsRunning(true);
    setIsPaused(false);
  };

  const togglePause = () => {
    setIsPaused(!isPaused);
  };

  const stopRun = () => {
    setIsRunning(false);
    setIsPaused(false);
    
    // Guardar resumen
    const summary = {
      distance: distance.toFixed(2),
      time: formatTime(runTime),
      avgPace: formatPace(avgPace),
      maxSpeed: maxSpeed.toFixed(1),
      calories: calories,
      coordinates: coordinates
    };
    
    setFinalSummary(summary);
    setScreen('summary');
  };

  const resetAndGoHome = () => {
    setScreen('home');
    setRunTime(0);
    setDistance(0);
    setCoordinates([]);
    setCurrentPace(0);
    setAvgPace(0);
    setCurrentSpeed(0);
    setMaxSpeed(0);
    setCalories(0);
    lastPositionRef.current = null;
    lastUpdateTimeRef.current = Date.now();
    setFinalSummary(null);
  };

  // PANTALLA HOME
  if (screen === 'home') {
    return (
      <div style={styles.container}>
        <style>{cssStyles}</style>
        
        <div style={styles.content}>
          <div style={styles.card}>
            <h1 style={styles.title}>San Silvestre Murcia</h1>
            <p style={styles.subtitle}>Entrenamiento de Elisa</p>
            
            <div style={styles.countdown}>
              <div style={styles.countdownNumber}>{daysUntilRace}</div>
              <div style={styles.countdownLabel}>días hasta la carrera</div>
            </div>
          </div>

          {currentWeek && (
            <div style={styles.card}>
              <h2 style={styles.sectionTitle}>Esta Semana</h2>
              <div style={styles.statsGrid}>
                <div style={styles.statBox}>
                  <div style={styles.statLabel}>Distancia objetivo</div>
                  <div style={styles.statValue}>{currentWeek.distance} km</div>
                </div>
                <div style={styles.statBox}>
                  <div style={styles.statLabel}>Sesiones</div>
                  <div style={styles.statValue}>{currentWeek.sessions}</div>
                </div>
              </div>
              <p style={styles.description}>{currentWeek.description}</p>
            </div>
          )}

          <button onClick={startWarmUp} style={styles.primaryButton}>
            Iniciar Entrenamiento
          </button>

          <div style={styles.card}>
            <h3 style={styles.sectionTitle}>Plan Completo</h3>
            <div style={styles.planList}>
              {plan.map((week, idx) => (
                <div key={idx} style={styles.planItem}>
                  <span>Semana {week.week}</span>
                  <span style={styles.planDistance}>{week.distance} km</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // PANTALLA CALENTAMIENTO
  if (screen === 'warmup') {
    const currentExercise = warmUpExercises[warmUpIndex];
    const progress = ((warmUpExercises[warmUpIndex].duration - warmUpTimer) / warmUpExercises[warmUpIndex].duration) * 100;
    
    return (
      <div style={{...styles.container, background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'}}>
        <style>{cssStyles}</style>
        
        <div style={styles.content}>
          <div style={styles.card}>
            <h2 style={styles.sectionTitle}>Calentamiento</h2>
            
            <div style={styles.timerSection}>
              <div style={styles.timerDisplay}>{warmUpTimer}s</div>
              <div style={styles.progressBar}>
                <div style={{...styles.progressFill, width: `${progress}%`}} />
              </div>
              <div style={styles.exerciseCount}>
                Ejercicio {warmUpIndex + 1} de {warmUpExercises.length}
              </div>
            </div>

            <div style={styles.exerciseBox}>
              <h3 style={styles.exerciseName}>{currentExercise.name}</h3>
              <p style={styles.exerciseDesc}>{currentExercise.description}</p>
            </div>

            <div style={styles.buttonGroup}>
              <button
                onClick={() => setIsWarmUpActive(!isWarmUpActive)}
                style={styles.secondaryButton}
              >
                {isWarmUpActive ? 'Pausar' : 'Continuar'}
              </button>
              
              {warmUpIndex === warmUpExercises.length - 1 && warmUpTimer === 0 && (
                <button onClick={finishWarmUp} style={styles.successButton}>
                  Comenzar Carrera
                </button>
              )}
              
              <button onClick={skipWarmUp} style={styles.skipButton}>
                Saltar
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // PANTALLA CORRIENDO
  if (screen === 'running') {
    return (
      <div style={{...styles.container, background: isPaused ? 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)' : 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)'}}>
        <style>{cssStyles}</style>
        
        <div style={styles.content}>
          <div style={styles.card}>
            <div style={styles.mainTimer}>
              <div style={styles.mainTimerValue}>{formatTime(runTime)}</div>
              <div style={styles.mainTimerLabel}>{isPaused ? 'PAUSADO' : 'Tiempo transcurrido'}</div>
            </div>

            <div style={styles.statsGrid}>
              <div style={styles.runStatBox}>
                <div style={styles.runStatLabel}>Distancia</div>
                <div style={styles.runStatValue}>{distance.toFixed(2)} km</div>
              </div>
              
              <div style={styles.runStatBox}>
                <div style={styles.runStatLabel}>Calorías</div>
                <div style={styles.runStatValue}>{calories} kcal</div>
              </div>
            </div>

            <div style={styles.statsGrid}>
              <div style={styles.runStatBox}>
                <div style={styles.runStatLabel}>Ritmo promedio</div>
                <div style={styles.runStatValue}>{formatPace(avgPace)}</div>
                <div style={styles.runStatUnit}>min/km</div>
              </div>
              
              <div style={styles.runStatBox}>
                <div style={styles.runStatLabel}>Ritmo actual</div>
                <div style={{...styles.runStatValue, color: isPaused ? '#cbd5e0' : '#4facfe'}}>
                  {isPaused ? '--:--' : formatPace(currentPace)}
                </div>
                <div style={styles.runStatUnit}>min/km</div>
              </div>
            </div>

            <div style={styles.statsGrid}>
              <div style={styles.runStatBox}>
                <div style={styles.runStatLabel}>Velocidad actual</div>
                <div style={{...styles.runStatValue, color: isPaused ? '#cbd5e0' : '#48bb78'}}>
                  {isPaused ? '--' : currentSpeed.toFixed(1)}
                </div>
                <div style={styles.runStatUnit}>km/h</div>
              </div>
              
              <div style={styles.runStatBox}>
                <div style={styles.runStatLabel}>Velocidad máx</div>
                <div style={styles.runStatValue}>{maxSpeed.toFixed(1)}</div>
                <div style={styles.runStatUnit}>km/h</div>
              </div>
            </div>

            <div style={styles.gpsInfo}>
              GPS: {coordinates.length} puntos | Precisión: {coordinates.length > 0 ? Math.round(coordinates[coordinates.length - 1].accuracy) + 'm' : '--'}
            </div>
          </div>

          <div style={styles.buttonGroup}>
            <button
              onClick={togglePause}
              style={isPaused ? styles.successButton : styles.secondaryButton}
            >
              {isPaused ? 'Continuar' : 'Pausar'}
            </button>
            
            <button onClick={stopRun} style={styles.dangerButton}>
              Finalizar
            </button>
          </div>
        </div>
      </div>
    );
  }

  // PANTALLA RESUMEN CON MAPA
  if (screen === 'summary' && finalSummary) {
    const bounds = coordinates.length > 0 ? {
      minLat: Math.min(...coordinates.map(c => c.lat)),
      maxLat: Math.max(...coordinates.map(c => c.lat)),
      minLng: Math.min(...coordinates.map(c => c.lng)),
      maxLng: Math.max(...coordinates.map(c => c.lng))
    } : null;

    const centerLat = bounds ? (bounds.minLat + bounds.maxLat) / 2 : 0;
    const centerLng = bounds ? (bounds.minLng + bounds.maxLng) / 2 : 0;

    return (
      <div style={styles.container}>
        <style>{cssStyles}</style>
        
        <div style={styles.content}>
          <div style={styles.card}>
            <h2 style={styles.sectionTitle}>Entrenamiento Completado</h2>
            
            <div style={styles.summaryGrid}>
              <div style={styles.summaryBox}>
                <div style={styles.summaryLabel}>Distancia</div>
                <div style={styles.summaryValue}>{finalSummary.distance} km</div>
              </div>
              
              <div style={styles.summaryBox}>
                <div style={styles.summaryLabel}>Tiempo</div>
                <div style={styles.summaryValue}>{finalSummary.time}</div>
              </div>
              
              <div style={styles.summaryBox}>
                <div style={styles.summaryLabel}>Ritmo promedio</div>
                <div style={styles.summaryValue}>{finalSummary.avgPace}</div>
              </div>
              
              <div style={styles.summaryBox}>
                <div style={styles.summaryLabel}>Velocidad máx</div>
                <div style={styles.summaryValue}>{finalSummary.maxSpeed} km/h</div>
              </div>
              
              <div style={styles.summaryBox}>
                <div style={styles.summaryLabel}>Calorías</div>
                <div style={styles.summaryValue}>{finalSummary.calories} kcal</div>
              </div>
              
              <div style={styles.summaryBox}>
                <div style={styles.summaryLabel}>Puntos GPS</div>
                <div style={styles.summaryValue}>{coordinates.length}</div>
              </div>
            </div>
          </div>

          {coordinates.length > 1 && (
            <div style={styles.card}>
              <h3 style={styles.sectionTitle}>Mapa de la Ruta</h3>
              <div style={styles.mapContainer}>
                <iframe
                  style={styles.mapFrame}
                  src={`https://www.openstreetmap.org/export/embed.html?bbox=${bounds.minLng},${bounds.minLat},${bounds.maxLng},${bounds.maxLat}&layer=mapnik&marker=${centerLat},${centerLng}`}
                  title="Mapa de la ruta"
                />
              </div>
              <div style={styles.mapNote}>
                La ruta detallada se ha registrado con {coordinates.length} puntos GPS
              </div>
            </div>
          )}

          <button onClick={resetAndGoHome} style={styles.primaryButton}>
            Volver al Inicio
          </button>
        </div>
      </div>
    );
  }

  return null;
};

const styles = {
  container: {
    minHeight: '100vh',
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    padding: '20px',
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
  },
  content: {
    maxWidth: '500px',
    margin: '0 auto',
  },
  card: {
    background: 'white',
    borderRadius: '16px',
    padding: '24px',
    marginBottom: '16px',
    boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
  },
  title: {
    fontSize: '28px',
    fontWeight: '700',
    color: '#1a202c',
    margin: '0 0 8px 0',
  },
  subtitle: {
    fontSize: '16px',
    color: '#718096',
    margin: '0 0 24px 0',
  },
  countdown: {
    background: '#f7fafc',
    borderRadius: '12px',
    padding: '24px',
    textAlign: 'center',
  },
  countdownNumber: {
    fontSize: '56px',
    fontWeight: '700',
    color: '#667eea',
    lineHeight: '1',
  },
  countdownLabel: {
    fontSize: '14px',
    color: '#718096',
    marginTop: '8px',
  },
  sectionTitle: {
    fontSize: '20px',
    fontWeight: '600',
    color: '#1a202c',
    margin: '0 0 16px 0',
  },
  statsGrid: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '12px',
    marginBottom: '16px',
  },
  statBox: {
    background: '#f7fafc',
    borderRadius: '12px',
    padding: '16px',
    textAlign: 'center',
  },
  statLabel: {
    fontSize: '12px',
    color: '#718096',
    marginBottom: '4px',
  },
  statValue: {
    fontSize: '24px',
    fontWeight: '700',
    color: '#667eea',
  },
  description: {
    fontSize: '14px',
    color: '#718096',
    fontStyle: 'italic',
    margin: '0',
  },
  primaryButton: {
    width: '100%',
    background: 'white',
    color: '#1a202c',
    border: 'none',
    borderRadius: '16px',
    padding: '24px',
    fontSize: '18px',
    fontWeight: '600',
    cursor: 'pointer',
    marginBottom: '16px',
    boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
    transition: 'transform 0.2s',
  },
  secondaryButton: {
    flex: '1',
    background: '#667eea',
    color: 'white',
    border: 'none',
    borderRadius: '12px',
    padding: '16px',
    fontSize: '16px',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'background 0.2s',
  },
  successButton: {
    flex: '1',
    background: '#48bb78',
    color: 'white',
    border: 'none',
    borderRadius: '12px',
    padding: '16px',
    fontSize: '16px',
    fontWeight: '600',
    cursor: 'pointer',
  },
  skipButton: {
    flex: '1',
    background: '#e2e8f0',
    color: '#4a5568',
    border: 'none',
    borderRadius: '12px',
    padding: '16px',
    fontSize: '16px',
    fontWeight: '600',
    cursor: 'pointer',
  },
  dangerButton: {
    flex: '1',
    background: '#f56565',
    color: 'white',
    border: 'none',
    borderRadius: '12px',
    padding: '16px',
    fontSize: '16px',
    fontWeight: '600',
    cursor: 'pointer',
  },
  planList: {
    maxHeight: '300px',
    overflowY: 'auto',
  },
  planItem: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    background: '#f7fafc',
    borderRadius: '8px',
    padding: '12px 16px',
    marginBottom: '8px',
    fontSize: '14px',
    color: '#4a5568',
  },
  planDistance: {
    fontWeight: '700',
    color: '#667eea',
  },
  timerSection: {
    textAlign: 'center',
    marginBottom: '24px',
  },
  timerDisplay: {
    fontSize: '72px',
    fontWeight: '700',
    color: '#667eea',
    lineHeight: '1',
    marginBottom: '16px',
  },
  progressBar: {
    width: '100%',
    height: '8px',
    background: '#e2e8f0',
    borderRadius: '4px',
    overflow: 'hidden',
    marginBottom: '12px',
  },
  progressFill: {
    height: '100%',
    background: '#667eea',
    transition: 'width 1s linear',
  },
  exerciseCount: {
    fontSize: '12px',
    color: '#718096',
  },
  exerciseBox: {
    background: '#f7fafc',
    borderRadius: '12px',
    padding: '20px',
    marginBottom: '24px',
  },
  exerciseName: {
    fontSize: '18px',
    fontWeight: '600',
    color: '#1a202c',
    margin: '0 0 8px 0',
  },
  exerciseDesc: {
    fontSize: '14px',
    color: '#718096',
    margin: '0',
  },
  buttonGroup: {
    display: 'flex',
    gap: '12px',
  },
  mainTimer: {
    textAlign: 'center',
    marginBottom: '24px',
  },
  mainTimerValue: {
    fontSize: '64px',
    fontWeight: '700',
    color: '#4facfe',
    lineHeight: '1',
  },
  mainTimerLabel: {
    fontSize: '14px',
    color: '#718096',
    marginTop: '8px',
    fontWeight: '600',
  },
  runStatBox: {
    background: '#f7fafc',
    borderRadius: '12px',
    padding: '16px',
    textAlign: 'center',
  },
  runStatLabel: {
    fontSize: '12px',
    color: '#718096',
    marginBottom: '4px',
  },
  runStatValue: {
    fontSize: '20px',
    fontWeight: '700',
    color: '#4facfe',
  },
  runStatUnit: {
    fontSize: '11px',
    color: '#a0aec0',
    marginTop: '2px',
  },
  gpsInfo: {
    fontSize: '12px',
    color: '#718096',
    textAlign: 'center',
    marginTop: '16px',
    padding: '12px',
    background: '#f7fafc',
    borderRadius: '8px',
  },
  summaryGrid: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '12px',
  },
  summaryBox: {
    background: '#f7fafc',
    borderRadius: '12px',
    padding: '16px',
    textAlign: 'center',
  },
  summaryLabel: {
    fontSize: '12px',
    color: '#718096',
    marginBottom: '8px',
  },
  summaryValue: {
    fontSize: '22px',
    fontWeight: '700',
    color: '#667eea',
  },
  mapContainer: {
    width: '100%',
    height: '300px',
    borderRadius: '12px',
    overflow: 'hidden',
    marginBottom: '12px',
  },
  mapFrame: {
    width: '100%',
    height: '100%',
    border: 'none',
  },
  mapNote: {
    fontSize: '12px',
    color: '#718096',
    textAlign: 'center',
    fontStyle: 'italic',
  },
};

const cssStyles = `
  button:active {
    transform: scale(0.98);
  }
  button:hover {
    opacity: 0.9);
  }
`;

export default SanSilvestreApp;