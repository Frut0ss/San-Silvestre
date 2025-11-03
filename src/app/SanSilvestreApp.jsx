import React, { useState, useEffect, useRef } from 'react';

// Traducciones
const translations = {
  es: {
    title: 'San Silvestre Murcia',
    subtitle: 'Entrenamiento de Elisa',
    daysUntilRace: 'días hasta la carrera',
    thisWeek: 'Esta Semana',
    weekPassed: 'Semana pasada',
    targetDistance: 'Distancia objetivo',
    sessions: 'Sesiones',
    startTraining: 'Iniciar Entrenamiento',
    completePlan: 'Plan Completo',
    week: 'Semana',
    warmup: 'Calentamiento',
    exercise: 'Ejercicio',
    of: 'de',
    pause: 'Pausar',
    continue: 'Continuar',
    startRace: 'Comenzar Carrera',
    skip: 'Saltar',
    time: 'Tiempo',
    paused: 'PAUSADO',
    distance: 'Distancia',
    maxSpeed: 'Velocidad máx',
    avgPace: 'Ritmo promedio',
    currentPace: 'Ritmo actual',
    currentSpeed: 'Velocidad actual',
    gpsStatus: 'Estado GPS',
    active: 'Activo',
    finish: 'Finalizar',
    trainingCompleted: 'Entrenamiento Completado',
    routeMap: 'Ruta del Entrenamiento',
    drawingRoute: 'Dibujando ruta...',
    routeCompleted: 'Ruta completada',
    backToHome: 'Volver al Inicio',
    session: 'Sesión',
    weekDescriptions: {
      race: 'Semana de carrera - reducir intensidad',
      tapering: 'Semana de ajuste fino',
      building: 'Construcción de base'
    },
    sessionTypes: {
      continuous: 'Carrera continua suave',
      intervals: 'Intervalos 1min rápido / 2min suave',
      progressive: 'Carrera a ritmo progresivo',
      long: 'Carrera larga y suave'
    }
  },
  en: {
    title: 'San Silvestre Murcia',
    subtitle: "Elisa's Training",
    daysUntilRace: 'days until race',
    thisWeek: 'This Week',
    weekPassed: 'Past week',
    targetDistance: 'Target distance',
    sessions: 'Sessions',
    startTraining: 'Start Training',
    completePlan: 'Complete Plan',
    week: 'Week',
    warmup: 'Warm-up',
    exercise: 'Exercise',
    of: 'of',
    pause: 'Pause',
    continue: 'Continue',
    startRace: 'Start Race',
    skip: 'Skip',
    time: 'Time',
    paused: 'PAUSED',
    distance: 'Distance',
    maxSpeed: 'Max speed',
    avgPace: 'Average pace',
    currentPace: 'Current pace',
    currentSpeed: 'Current speed',
    gpsStatus: 'GPS Status',
    active: 'Active',
    finish: 'Finish',
    trainingCompleted: 'Training Completed',
    routeMap: 'Training Route',
    drawingRoute: 'Drawing route...',
    routeCompleted: 'Route completed',
    backToHome: 'Back to Home',
    session: 'Session',
    weekDescriptions: {
      race: 'Race week - reduce intensity',
      tapering: 'Tapering week',
      building: 'Base building'
    },
    sessionTypes: {
      continuous: 'Easy continuous run',
      intervals: 'Intervals 1min fast / 2min easy',
      progressive: 'Progressive pace run',
      long: 'Long easy run'
    }
  }
};

const warmUpExercisesData = {
  es: [
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
  ],
  en: [
    { name: 'Ankle rotations', duration: 30, description: '30 seconds - circles with both ankles' },
    { name: 'Knee rotations', duration: 30, description: '30 seconds - gentle circles' },
    { name: 'Hip rotations', duration: 30, description: '30 seconds - wide circles' },
    { name: 'Arm circles', duration: 30, description: '30 seconds - forward and back' },
    { name: 'Quad stretch', duration: 30, description: '30 seconds - hold each leg' },
    { name: 'Calf stretch', duration: 30, description: '30 seconds - both legs' },
    { name: 'Light walking', duration: 120, description: '2 minutes walking at brisk pace' },
    { name: 'Knee raises', duration: 45, description: '45 seconds - march in place' },
    { name: 'Heel to glute', duration: 45, description: '45 seconds - alternating legs' },
    { name: 'Dynamic lunges', duration: 60, description: '1 minute - 10 repetitions' },
    { name: 'Easy jog', duration: 180, description: '3 minutes at very easy pace' }
  ]
};

const generateTrainingPlan = (lang) => {
  const t = translations[lang];
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
    const sessions = [];
    const numSessions = week < 3 ? 3 : 4;
    
    for (let i = 1; i <= numSessions; i++) {
      sessions.push({
        id: `week${week}_session${i}`,
        name: `${t.session} ${i}`,
        distance: distance.toFixed(1),
        description: i === 1 ? t.sessionTypes.continuous : 
                    i === 2 ? t.sessionTypes.intervals :
                    i === 3 ? t.sessionTypes.progressive :
                    t.sessionTypes.long,
        completed: false
      });
    }
    
    plan.push({
      week,
      distance: distance.toFixed(1),
      sessions: sessions,
      description: week === weeksUntilRace ? t.weekDescriptions.race : 
                   week > weeksUntilRace - 2 ? t.weekDescriptions.tapering : t.weekDescriptions.building
    });
  }
  
  return { plan, daysUntilRace, weeksUntilRace };
};

const SanSilvestreApp = () => {
  const [language, setLanguage] = useState('es');
  const [screen, setScreen] = useState('home');
  const [expandedWeek, setExpandedWeek] = useState(null);
  const [completedSessions, setCompletedSessions] = useState({});
  
  const t = translations[language];
  const warmUpExercises = warmUpExercisesData[language];
  
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
  
  // Referencias para Worker y WakeLock
  const workerRef = useRef(null);
  const wakeLockRef = useRef(null);
  const notificationPermissionRef = useRef(false);
  
  const [finalSummary, setFinalSummary] = useState(null);
  const [routeProgress, setRouteProgress] = useState(0);
  
  const watchIdRef = useRef(null);
  const lastPositionRef = useRef(null);
  const runIntervalRef = useRef(null);
  const lastUpdateTimeRef = useRef(Date.now());
  const canvasRef = useRef(null);
  
  const { plan, daysUntilRace, weeksUntilRace } = generateTrainingPlan(language);
  const currentWeekIndex = Math.min(plan.length - 1, Math.floor(plan.length - weeksUntilRace));
  const currentWeek = plan[currentWeekIndex];

  // Calcular el número de la semana actual y las semanas pasadas
  const raceDate = new Date('2025-12-31');
  const startDate = new Date(raceDate);
  startDate.setDate(startDate.getDate() - (plan.length * 7));
  const today = new Date();
  const weeksPassed = Math.floor((today - startDate) / (1000 * 60 * 60 * 24 * 7));

  // Cargar idioma desde localStorage
  useEffect(() => {
    const savedLang = localStorage.getItem('sanSilvestreLanguage');
    if (savedLang && (savedLang === 'es' || savedLang === 'en')) {
      setLanguage(savedLang);
    }
  }, []);

  // Guardar idioma en localStorage
  const changeLanguage = (lang) => {
    setLanguage(lang);
    localStorage.setItem('sanSilvestreLanguage', lang);
  };

  // Cargar sesiones completadas desde localStorage
  useEffect(() => {
    const saved = localStorage.getItem('sanSilvestreCompleted');
    if (saved) {
      setCompletedSessions(JSON.parse(saved));
    }
  }, []);

  // Guardar sesiones completadas en localStorage
  const toggleSessionComplete = (sessionId) => {
    const currentStatus = completedSessions[sessionId];
    // Rotar entre estados: undefined (pendiente) -> true (completado) -> 'not-done' (no hecho) -> undefined
    const newStatus = currentStatus === undefined ? true : 
                     currentStatus === true ? 'not-done' : 
                     undefined;
    
    const newCompleted = {
      ...completedSessions,
      [sessionId]: newStatus
    };
    
    // Si el estado es undefined (pendiente), eliminar la entrada del objeto
    if (newStatus === undefined) {
      delete newCompleted[sessionId];
    }
    
    setCompletedSessions(newCompleted);
    localStorage.setItem('sanSilvestreCompleted', JSON.stringify(newCompleted));
  };

  // Animar ruta en el canvas
  useEffect(() => {
    if (screen === 'summary' && canvasRef.current && coordinates.length > 1) {
      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d');
      const width = canvas.width;
      const height = canvas.height;

      // Calcular bounds
      const lats = coordinates.map(c => c.lat);
      const lngs = coordinates.map(c => c.lng);
      const minLat = Math.min(...lats);
      const maxLat = Math.max(...lats);
      const minLng = Math.min(...lngs);
      const maxLng = Math.max(...lngs);
      
      const padding = 20;
      const latRange = maxLat - minLat || 0.001;
      const lngRange = maxLng - minLng || 0.001;

      // Función para mapear coordenadas a canvas
      const mapToCanvas = (lat, lng) => {
        const x = padding + ((lng - minLng) / lngRange) * (width - 2 * padding);
        const y = height - padding - ((lat - minLat) / latRange) * (height - 2 * padding);
        return { x, y };
      };

      // Limpiar canvas
      ctx.clearRect(0, 0, width, height);
      
      // Dibujar fondo
      ctx.fillStyle = '#f0f0f0';
      ctx.fillRect(0, 0, width, height);
      
      // Dibujar grid
      ctx.strokeStyle = '#e0e0e0';
      ctx.lineWidth = 1;
      for (let i = 0; i < 5; i++) {
        const x = (width / 4) * i;
        const y = (height / 4) * i;
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, height);
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(width, y);
        ctx.stroke();
      }

      // Animar la ruta
      let progress = 0;
      const animationDuration = 3000;
      const startTime = Date.now();

      const animate = () => {
        const elapsed = Date.now() - startTime;
        progress = Math.min(elapsed / animationDuration, 1);
        
        const pointsToShow = Math.floor(coordinates.length * progress);
        
        if (pointsToShow > 1) {
          ctx.strokeStyle = '#3b82f6';
          ctx.lineWidth = 3;
          ctx.lineCap = 'round';
          ctx.lineJoin = 'round';
          
          ctx.beginPath();
          const start = mapToCanvas(coordinates[0].lat, coordinates[0].lng);
          ctx.moveTo(start.x, start.y);
          
          for (let i = 1; i < pointsToShow; i++) {
            const point = mapToCanvas(coordinates[i].lat, coordinates[i].lng);
            ctx.lineTo(point.x, point.y);
          }
          ctx.stroke();
          
          // Punto de inicio
          ctx.fillStyle = '#10b981';
          ctx.beginPath();
          ctx.arc(start.x, start.y, 6, 0, Math.PI * 2);
          ctx.fill();
          
          // Punto actual/final
          if (pointsToShow > 0) {
            const current = mapToCanvas(
              coordinates[pointsToShow - 1].lat,
              coordinates[pointsToShow - 1].lng
            );
            ctx.fillStyle = progress < 1 ? '#3b82f6' : '#ef4444';
            ctx.beginPath();
            ctx.arc(current.x, current.y, 6, 0, Math.PI * 2);
            ctx.fill();
          }
        }
        
        setRouteProgress(progress);
        
        if (progress < 1) {
          requestAnimationFrame(animate);
        }
      };
      
      animate();
    }
  }, [screen, coordinates]);

  // Lógica de calentamiento
  useEffect(() => {
    let interval;
    if (isWarmUpActive && warmUpTimer > 0) {
      interval = setInterval(() => {
        setWarmUpTimer(prev => {
          if (prev <= 1) {
            setIsWarmUpActive(false);
            if (warmUpIndex < warmUpExercises.length - 1) {
              setWarmUpIndex(prevIndex => prevIndex + 1);
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
  }, [isWarmUpActive, warmUpTimer, warmUpIndex, warmUpExercises]);

  // Geolocalización y carrera
  // Solicitar permisos de notificación
  useEffect(() => {
    const requestNotificationPermission = async () => {
      if ('Notification' in window) {
        const permission = await Notification.requestPermission();
        notificationPermissionRef.current = permission === 'granted';
      }
    };
    requestNotificationPermission();
  }, []);

  // Inicializar Web Worker
  useEffect(() => {
    workerRef.current = new Worker(new URL('../utils/timerWorker.js', import.meta.url));
    workerRef.current.onmessage = (e) => {
      if (e.data.type === 'tick') {
        setRunTime(e.data.time);
        
        // Enviar notificación cada 5 minutos
        if (e.data.time % 300 === 0 && notificationPermissionRef.current) {
          new Notification('Entrenamiento en curso', {
            body: `Tiempo: ${formatTime(e.data.time)} - Distancia: ${distance.toFixed(2)}km`,
            icon: '/icon.png' // Asegúrate de tener un icono en tu proyecto
          });
        }
      }
    };

    return () => {
      if (workerRef.current) {
        workerRef.current.terminate();
      }
    };
  }, [distance]);

  // Gestionar Wake Lock
  useEffect(() => {
    const requestWakeLock = async () => {
      if ('wakeLock' in navigator) {
        try {
          wakeLockRef.current = await navigator.wakeLock.request('screen');
        } catch (err) {
          console.log('Wake Lock error:', err);
        }
      }
    };

    const releaseWakeLock = async () => {
      if (wakeLockRef.current) {
        await wakeLockRef.current.release();
        wakeLockRef.current = null;
      }
    };

    if (isRunning && !isPaused) {
      requestWakeLock();
    } else {
      releaseWakeLock();
    }

    // Reactivar Wake Lock cuando la pantalla se vuelve a encender
    const handleVisibilityChange = async () => {
      if (document.visibilityState === 'visible' && isRunning && !isPaused) {
        await requestWakeLock();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      releaseWakeLock();
    };
  }, [isRunning, isPaused]);

  // Gestionar geolocalización y temporizador
  useEffect(() => {
    if (isRunning && !isPaused) {
      // Iniciar el Web Worker
      workerRef.current?.postMessage({ 
        command: 'start',
        elapsedTime: runTime * 1000 // Convertir a milisegundos
      });

      // Iniciar seguimiento GPS
      if ('geolocation' in navigator) {
        watchIdRef.current = navigator.geolocation.watchPosition(
          (position) => {
            const { latitude, longitude, speed, accuracy } = position.coords;
            const now = Date.now();
            
            if (accuracy > 50) return;
            
            const newCoord = { 
              lat: latitude, 
              lng: longitude, 
              timestamp: now,
              speed,
              accuracy
            };
            
            setCoordinates(prev => [...prev, newCoord]);
            
            if (lastPositionRef.current) {
              const timeDiff = (now - lastUpdateTimeRef.current) / 1000;
              
              if (timeDiff >= 2) {
                const dist = calculateDistance(
                  lastPositionRef.current.lat,
                  lastPositionRef.current.lng,
                  latitude,
                  longitude
                );
                
                if (dist > 0.001 && dist < 0.1) {
                  setDistance(prev => prev + dist);
                  lastUpdateTimeRef.current = now;
                }
              }
            }
            
            lastPositionRef.current = newCoord;
            
            if (speed !== null && speed >= 0) {
              const speedKmh = speed * 3.6;
              setCurrentSpeed(speedKmh);
              setMaxSpeed(prev => Math.max(prev, speedKmh));
            }
          },
          (error) => console.error('GPS Error:', error),
          { enableHighAccuracy: true, maximumAge: 1000, timeout: 5000 }
        );
      }
    } else if (isPaused) {
      // Pausar el Web Worker
      workerRef.current?.postMessage({ command: 'pause' });
      
      if (watchIdRef.current) {
        navigator.geolocation.clearWatch(watchIdRef.current);
        watchIdRef.current = null;
      }
    }
    
    return () => {
      if (watchIdRef.current) {
        navigator.geolocation.clearWatch(watchIdRef.current);
      }
      workerRef.current?.postMessage({ command: 'stop' });
    };
  }, [isRunning, isPaused]);

  // Calcular ritmo
  useEffect(() => {
    if (distance > 0 && runTime > 0) {
      const timeInMinutes = runTime / 60;
      const paceMinPerKm = timeInMinutes / distance;
      setAvgPace(paceMinPerKm);
      
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

  const [selectedSession, setSelectedSession] = useState(null);

  // Función para encontrar la siguiente sesión
  const findNextSession = () => {
    // Si hay una sesión seleccionada, empezar a buscar desde ahí
    let startWeekIndex = currentWeekIndex;
    let startSessionIndex = 0;

    if (selectedSession) {
      startWeekIndex = plan.findIndex(w => w.week === selectedSession.week.week);
      if (startWeekIndex !== -1) {
        startSessionIndex = selectedSession.week.sessions.findIndex(s => s.id === selectedSession.session.id) + 1;
      }
    }

    // Función para verificar si una sesión está pendiente (ni completada ni marcada como no hecha)
    const isPending = (sessionId) => {
      return !completedSessions[sessionId] || completedSessions[sessionId] === undefined;
    };

    // Buscar en la semana actual desde la sesión actual
    if (startWeekIndex >= 0 && startWeekIndex < plan.length) {
      const currentWeekSessions = plan[startWeekIndex].sessions;
      for (let i = startSessionIndex; i < currentWeekSessions.length; i++) {
        if (isPending(currentWeekSessions[i].id)) {
          return { week: plan[startWeekIndex], session: currentWeekSessions[i] };
        }
      }
    }

    // Buscar en las siguientes semanas
    for (let weekIndex = startWeekIndex + 1; weekIndex < plan.length; weekIndex++) {
      const nextSession = plan[weekIndex].sessions.find(s => isPending(s.id));
      if (nextSession) {
        return { week: plan[weekIndex], session: nextSession };
      }
    }

    // Si no encontramos nada hacia adelante, buscar desde el principio
    for (let weekIndex = 0; weekIndex <= startWeekIndex; weekIndex++) {
      const nextSession = plan[weekIndex].sessions.find(s => isPending(s.id));
      if (nextSession) {
        return { week: plan[weekIndex], session: nextSession };
      }
    }

    // Si todas están completadas o marcadas como no hechas, devolver la primera sesión
    return { week: plan[0], session: plan[0].sessions[0] };
  };

  // Actualizar la sesión seleccionada cuando cambia el plan o las sesiones completadas
  useEffect(() => {
    // Si la sesión actual está completada o marcada como no hecha, buscar la siguiente
    if (selectedSession && 
        (completedSessions[selectedSession.session.id] === true || 
         completedSessions[selectedSession.session.id] === 'not-done')) {
      const nextSession = findNextSession();
      // Solo actualizar si encontramos una sesión diferente
      if (nextSession.session.id !== selectedSession.session.id) {
        setSelectedSession(nextSession);
      }
    } 
    // Si no hay sesión seleccionada, seleccionar la siguiente disponible
    else if (!selectedSession) {
      const nextSession = findNextSession();
      setSelectedSession(nextSession);
    }
  }, [plan, completedSessions, selectedSession]);

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
    
    const summary = {
      distance: distance.toFixed(2),
      time: formatTime(runTime),
      avgPace: formatPace(avgPace),
      maxSpeed: maxSpeed.toFixed(1),
      coordinates
    };
    
    // Marcar la sesión como completada si hay una sesión seleccionada
    if (selectedSession) {
      toggleSessionComplete(selectedSession.session.id);
    }
    
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
    lastPositionRef.current = null;
    lastUpdateTimeRef.current = Date.now();
    setFinalSummary(null);
    setRouteProgress(0);
  };

  // HOME
  if (screen === 'home') {
    return (
      <div style={styles.container}>
        <style>{cssStyles}</style>
        
        <div style={styles.content}>
          {/* Selector de idioma */}
          <div style={styles.languageSelector}>
            <button
              onClick={() => changeLanguage('es')}
              style={{
                ...styles.langButton,
                ...(language === 'es' ? styles.langButtonActive : {})
              }}
            >
              ES
            </button>
            <button
              onClick={() => changeLanguage('en')}
              style={{
                ...styles.langButton,
                ...(language === 'en' ? styles.langButtonActive : {})
              }}
            >
              EN
            </button>
          </div>

          <div style={styles.card}>
            <h1 style={styles.title}>{t.title}</h1>
            <p style={styles.subtitle}>{t.subtitle}</p>
            
            <div style={styles.countdown}>
              <div style={styles.countdownNumber}>{daysUntilRace}</div>
              <div style={styles.countdownLabel}>{t.daysUntilRace}</div>
            </div>
          </div>

          {currentWeek && (
            <div style={styles.card}>
              <h2 style={styles.sectionTitle}>{t.thisWeek}</h2>
              <div style={styles.statsGrid}>
                <div style={styles.statBox}>
                  <div style={styles.statLabel}>{t.targetDistance}</div>
                  <div style={styles.statValue}>{currentWeek.distance} km</div>
                </div>
                <div style={styles.statBox}>
                  <div style={styles.statLabel}>{t.sessions}</div>
                  <div style={styles.statValue}>{currentWeek.sessions.length}</div>
                </div>
              </div>
              <p style={styles.description}>{currentWeek.description}</p>
            </div>
          )}

          <button onClick={startWarmUp} style={styles.primaryButton}>
            {selectedSession 
              ? `${t.startTraining} - ${t.week} ${selectedSession.week.week}, ${selectedSession.session.name}`
              : t.startTraining}
          </button>

          <div style={styles.card}>
            <h3 style={styles.sectionTitle}>{t.completePlan}</h3>
            <div style={styles.planList}>
              {plan.map((week, idx) => (
                <div key={idx}>
                  <div 
                    style={{
                      ...styles.planItem,
                      ...(idx === currentWeekIndex ? styles.currentWeekItem : {}),
                      ...(idx < weeksPassed ? styles.pastWeekItem : {})
                    }}
                    onClick={() => setExpandedWeek(expandedWeek === week.week ? null : week.week)}
                  >
                    <div style={styles.weekInfo}>
                      <span style={styles.weekLabel}>
                        {t.week} {week.week}
                        {idx === currentWeekIndex && 
                          <span style={styles.currentWeekBadge}>{t.thisWeek}</span>
                        }
                        {idx < weeksPassed && idx !== currentWeekIndex &&
                          <span style={styles.pastWeekBadge}>{t.weekPassed}</span>
                        }
                      </span>
                    </div>
                    <span style={styles.planDistance}>{week.distance} km</span>
                  </div>
                  
                  {expandedWeek === week.week && (
                    <div style={styles.sessionList}>
                      {week.sessions.map((session) => (
                        <div key={session.id} style={{
                        ...styles.sessionItem,
                        ...(selectedSession && selectedSession.session.id === session.id ? styles.selectedSession : {}),
                        ...(completedSessions[session.id] === true ? styles.completedSession : {}),
                        ...(completedSessions[session.id] === 'not-done' ? styles.notDoneSession : {})
                      }}>
                          <div 
                            style={{...styles.sessionInfo, cursor: 'pointer'}}
                            onClick={() => setSelectedSession({ week, session })}
                          >
                            <div style={styles.sessionName}>{session.name}</div>
                            <div style={styles.sessionDesc}>{session.description}</div>
                            <div style={styles.sessionDistance}>{session.distance} km</div>
                          </div>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              toggleSessionComplete(session.id);
                            }}
                            style={styles.completeButton}
                          >
                            {completedSessions[session.id] === true ? '✓' : 
                             completedSessions[session.id] === 'not-done' ? '✕' : '○'}
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // WARMUP
  if (screen === 'warmup') {
    const currentExercise = warmUpExercises[warmUpIndex];
    const progress = ((warmUpExercises[warmUpIndex].duration - warmUpTimer) / warmUpExercises[warmUpIndex].duration) * 100;
    
    return (
      <div style={styles.container}>
        <style>{cssStyles}</style>
        
        <div style={styles.content}>
          <div style={styles.card}>
            <h2 style={styles.sectionTitle}>{t.warmup}</h2>
            
            <div style={styles.timerSection}>
              <div style={styles.timerDisplay}>{warmUpTimer}s</div>
              <div style={styles.progressBar}>
                <div style={{...styles.progressFill, width: `${progress}%`}} />
              </div>
              <div style={styles.exerciseCount}>
                {t.exercise} {warmUpIndex + 1} {t.of} {warmUpExercises.length}
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
                {isWarmUpActive ? t.pause : t.continue}
              </button>
              
              {warmUpIndex === warmUpExercises.length - 1 && warmUpTimer === 0 && (
                <button onClick={finishWarmUp} style={styles.successButton}>
                  {t.startRace}
                </button>
              )}
              
              <button onClick={skipWarmUp} style={styles.skipButton}>
                {t.skip}
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // RUNNING
  if (screen === 'running') {
    return (
      <div style={styles.container}>
        <style>{cssStyles}</style>
        
        <div style={styles.content}>
          <div style={styles.card}>
            <div style={styles.mainTimer}>
              <div style={styles.mainTimerValue}>{formatTime(runTime)}</div>
              <div style={styles.mainTimerLabel}>{isPaused ? t.paused : t.time}</div>
            </div>

            <div style={styles.statsGrid}>
              <div style={styles.runStatBox}>
                <div style={styles.runStatLabel}>{t.distance}</div>
                <div style={styles.runStatValue}>{distance.toFixed(2)} km</div>
              </div>
              
              <div style={styles.runStatBox}>
                <div style={styles.runStatLabel}>{t.maxSpeed}</div>
                <div style={styles.runStatValue}>{maxSpeed.toFixed(1)} km/h</div>
              </div>
            </div>

            <div style={styles.statsGrid}>
              <div style={styles.runStatBox}>
                <div style={styles.runStatLabel}>{t.avgPace}</div>
                <div style={styles.runStatValue}>{formatPace(avgPace)}</div>
                <div style={styles.runStatUnit}>min/km</div>
              </div>
              
              <div style={styles.runStatBox}>
                <div style={styles.runStatLabel}>{t.currentPace}</div>
                <div style={{...styles.runStatValue, color: isPaused ? '#cbd5e0' : '#2d3748'}}>
                  {isPaused ? '--:--' : formatPace(currentPace)}
                </div>
                <div style={styles.runStatUnit}>min/km</div>
              </div>
            </div>

            <div style={styles.statsGrid}>
              <div style={styles.runStatBox}>
                <div style={styles.runStatLabel}>{t.currentSpeed}</div>
                <div style={{...styles.runStatValue, color: isPaused ? '#cbd5e0' : '#2d3748'}}>
                  {isPaused ? '--' : currentSpeed.toFixed(1)} km/h
                </div>
              </div>
              
              <div style={styles.runStatBox}>
                <div style={styles.runStatLabel}>{t.gpsStatus}</div>
                <div style={{...styles.runStatValue, fontSize: '16px'}}>
                  {isPaused ? t.paused : t.active}
                </div>
              </div>
            </div>
          </div>

          <div style={styles.buttonGroup}>
            <button
              onClick={togglePause}
              style={isPaused ? styles.successButton : styles.secondaryButton}
            >
              {isPaused ? t.continue : t.pause}
            </button>
            
            <button onClick={stopRun} style={styles.dangerButton}>
              {t.finish}
            </button>
          </div>
        </div>
      </div>
    );
  }

  // SUMMARY
  if (screen === 'summary' && finalSummary) {
    return (
      <div style={styles.container}>
        <style>{cssStyles}</style>
        
        <div style={styles.content}>
          <div style={styles.card}>
            <h2 style={styles.sectionTitle}>{t.trainingCompleted}</h2>
            
            <div style={styles.summaryGrid}>
              <div style={styles.summaryBox}>
                <div style={styles.summaryLabel}>{t.distance}</div>
                <div style={styles.summaryValue}>{finalSummary.distance} km</div>
              </div>
              
              <div style={styles.summaryBox}>
                <div style={styles.summaryLabel}>{t.time}</div>
                <div style={styles.summaryValue}>{finalSummary.time}</div>
              </div>
              
              <div style={styles.summaryBox}>
                <div style={styles.summaryLabel}>{t.avgPace}</div>
                <div style={styles.summaryValue}>{finalSummary.avgPace}</div>
              </div>
              
              <div style={styles.summaryBox}>
                <div style={styles.summaryLabel}>{t.maxSpeed}</div>
                <div style={styles.summaryValue}>{finalSummary.maxSpeed} km/h</div>
              </div>
            </div>
          </div>

          {coordinates.length > 1 && (
            <div style={styles.card}>
              <h3 style={styles.sectionTitle}>{t.routeMap}</h3>
              <canvas
                ref={canvasRef}
                width={460}
                height={300}
                style={styles.canvas}
              />
              <div style={styles.mapNote}>
                {routeProgress < 1 ? t.drawingRoute : t.routeCompleted}
              </div>
            </div>
          )}

          <button onClick={resetAndGoHome} style={styles.primaryButton}>
            {t.backToHome}
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
    background: '#f5f5f5',
    padding: '20px',
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
  },
  content: {
    maxWidth: '500px',
    margin: '0 auto',
  },
  card: {
    background: 'white',
    borderRadius: '8px',
    padding: '20px',
    marginBottom: '16px',
    boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
  },
  title: {
    fontSize: '24px',
    fontWeight: '600',
    color: '#2d3748',
    margin: '0 0 4px 0',
  },
  subtitle: {
    fontSize: '14px',
    color: '#718096',
    margin: '0 0 20px 0',
  },
  countdown: {
    background: '#fafafa',
    borderRadius: '8px',
    padding: '20px',
    textAlign: 'center',
  },
  countdownNumber: {
    fontSize: '48px',
    fontWeight: '600',
    color: '#2d3748',
    lineHeight: '1',
  },
  countdownLabel: {
    fontSize: '13px',
    color: '#718096',
    marginTop: '6px',
  },
  sectionTitle: {
    fontSize: '18px',
    fontWeight: '600',
    color: '#2d3748',
    margin: '0 0 14px 0',
  },
  statsGrid: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '10px',
    marginBottom: '14px',
  },
  statBox: {
    background: '#fafafa',
    borderRadius: '6px',
    padding: '14px',
    textAlign: 'center',
  },
  statLabel: {
    fontSize: '11px',
    color: '#718096',
    marginBottom: '4px',
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
  },
  statValue: {
    fontSize: '20px',
    fontWeight: '600',
    color: '#2d3748',
  },
  description: {
    fontSize: '13px',
    color: '#718096',
    margin: '0',
    lineHeight: '1.5',
  },
  primaryButton: {
    width: '100%',
    background: '#2d3748',
    color: 'white',
    border: 'none',
    borderRadius: '6px',
    padding: '16px',
    fontSize: '15px',
    fontWeight: '500',
    cursor: 'pointer',
    marginBottom: '16px',
    transition: 'background 0.2s',
  },
  secondaryButton: {
    flex: '1',
    background: '#4a5568',
    color: 'white',
    border: 'none',
    borderRadius: '6px',
    padding: '14px',
    fontSize: '14px',
    fontWeight: '500',
    cursor: 'pointer',
    transition: 'background 0.2s',
  },
  successButton: {
    flex: '1',
    background: '#48bb78',
    color: 'white',
    border: 'none',
    borderRadius: '6px',
    padding: '14px',
    fontSize: '14px',
    fontWeight: '500',
    cursor: 'pointer',
  },
  skipButton: {
    flex: '1',
    background: '#e2e8f0',
    color: '#4a5568',
    border: 'none',
    borderRadius: '6px',
    padding: '14px',
    fontSize: '14px',
    fontWeight: '500',
    cursor: 'pointer',
  },
  dangerButton: {
    flex: '1',
    background: '#f56565',
    color: 'white',
    border: 'none',
    borderRadius: '6px',
    padding: '14px',
    fontSize: '14px',
    fontWeight: '500',
    cursor: 'pointer',
  },
  planList: {
    maxHeight: '400px',
    overflowY: 'auto',
  },
  planItem: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    background: '#fafafa',
    borderRadius: '6px',
    padding: '12px 14px',
    marginBottom: '6px',
    fontSize: '14px',
    color: '#4a5568',
    cursor: 'pointer',
    transition: 'background 0.2s',
  },
  planDistance: {
    fontWeight: '600',
    color: '#2d3748',
  },
  sessionList: {
    marginLeft: '12px',
    marginBottom: '12px',
    paddingLeft: '12px',
    borderLeft: '2px solid #e2e8f0',
  },
  sessionItem: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    background: 'white',
    border: '1px solid #e2e8f0',
    borderRadius: '6px',
    padding: '10px 12px',
    marginBottom: '6px',
  },
  sessionInfo: {
    flex: '1',
  },
  sessionName: {
    fontSize: '13px',
    fontWeight: '600',
    color: '#2d3748',
    marginBottom: '2px',
  },
  sessionDesc: {
    fontSize: '12px',
    color: '#718096',
    marginBottom: '4px',
  },
  sessionDistance: {
    fontSize: '11px',
    color: '#4a5568',
    fontWeight: '500',
  },
  completeButton: {
    width: '28px',
    height: '28px',
    marginLeft: '12px',
    border: '2px solid #cbd5e0',
    borderRadius: '50%',
    background: '#fff',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '16px',
    color: '#48bb78',
    padding: 0,
    transition: 'all 0.2s',
  },
  pendingSession: {
    background: '#fff',
    borderColor: '#e2e8f0',
  },
  timerSection: {
    textAlign: 'center',
    marginBottom: '20px',
  },
  timerDisplay: {
    fontSize: '56px',
    fontWeight: '600',
    color: '#2d3748',
    lineHeight: '1',
    marginBottom: '14px',
  },
  progressBar: {
    width: '100%',
    height: '6px',
    background: '#e2e8f0',
    borderRadius: '3px',
    overflow: 'hidden',
    marginBottom: '10px',
  },
  progressFill: {
    height: '100%',
    background: '#4a5568',
    transition: 'width 1s linear',
  },
  exerciseCount: {
    fontSize: '12px',
    color: '#718096',
  },
  exerciseBox: {
    background: '#fafafa',
    borderRadius: '6px',
    padding: '16px',
    marginBottom: '20px',
  },
  exerciseName: {
    fontSize: '16px',
    fontWeight: '600',
    color: '#2d3748',
    margin: '0 0 6px 0',
  },
  exerciseDesc: {
    fontSize: '13px',
    color: '#718096',
    margin: '0',
  },
  buttonGroup: {
    display: 'flex',
    gap: '10px',
  },
  mainTimer: {
    textAlign: 'center',
    marginBottom: '20px',
  },
  mainTimerValue: {
    fontSize: '52px',
    fontWeight: '600',
    color: '#2d3748',
    lineHeight: '1',
  },
  mainTimerLabel: {
    fontSize: '13px',
    color: '#718096',
    marginTop: '6px',
    fontWeight: '500',
  },
  runStatBox: {
    background: '#fafafa',
    borderRadius: '6px',
    padding: '14px',
    textAlign: 'center',
  },
  runStatLabel: {
    fontSize: '11px',
    color: '#718096',
    marginBottom: '4px',
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
  },
  runStatValue: {
    fontSize: '18px',
    fontWeight: '600',
    color: '#2d3748',
  },
  runStatUnit: {
    fontSize: '11px',
    color: '#a0aec0',
    marginTop: '2px',
  },
  summaryGrid: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '10px',
  },
  summaryBox: {
    background: '#fafafa',
    borderRadius: '6px',
    padding: '14px',
    textAlign: 'center',
  },
  summaryLabel: {
    fontSize: '11px',
    color: '#718096',
    marginBottom: '6px',
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
  },
  summaryValue: {
    fontSize: '18px',
    fontWeight: '600',
    color: '#2d3748',
  },
  canvas: {
    width: '100%',
    height: 'auto',
    borderRadius: '6px',
    border: '1px solid #e2e8f0',
    marginBottom: '10px',
  },
  mapNote: {
    fontSize: '12px',
    color: '#718096',
    textAlign: 'center',
  },
  languageSelector: {
    display: 'flex',
    gap: '8px',
    justifyContent: 'flex-end',
    marginBottom: '16px',
  },
  langButton: {
    background: 'white',
    color: '#718096',
    border: '1px solid #e2e8f0',
    borderRadius: '6px',
    padding: '8px 16px',
    fontSize: '13px',
    fontWeight: '500',
    cursor: 'pointer',
    transition: 'all 0.2s',
  },
    langButtonActive: {
    background: '#2d3748',
    color: 'white',
    borderColor: '#2d3748',
  },
  selectedSession: {
    border: '2px solid #3b82f6',
    background: '#ebf5ff',
  },
  completedSession: {
    background: '#f0fff4',
    borderColor: '#9ae6b4',
  },
  notDoneSession: {
    background: '#fff5f5',
    borderColor: '#feb2b2',
  },
  currentWeekItem: {
    borderLeft: '4px solid #3b82f6',
    background: '#ebf8ff',
  },
  pastWeekItem: {
    background: '#f7fafc',
    color: '#a0aec0',
  },
  weekInfo: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
  },
  weekLabel: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
  },
  currentWeekBadge: {
    background: '#3b82f6',
    color: 'white',
    padding: '2px 6px',
    borderRadius: '4px',
    fontSize: '11px',
    fontWeight: '500',
  },
  pastWeekBadge: {
    background: '#e2e8f0',
    color: '#718096',
    padding: '2px 6px',
    borderRadius: '4px',
    fontSize: '11px',
    fontWeight: '500',
  },
};const cssStyles = `
  button:active {
    transform: scale(0.98);
  }
  button:hover {
    opacity: 0.92;
  }
  .planItem:hover {
    background: #edf2f7 !important;
  }
  button.completeButton:hover {
    background: #f0fff4 !important;
    border-color: #48bb78 !important;
  }
  button.completeButton:active {
    transform: scale(0.95);
  }
`;

export default SanSilvestreApp;