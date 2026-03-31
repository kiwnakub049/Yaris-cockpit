#!/usr/bin/env python3
"""
Logger Setup
Configures logging for the entire application
"""

import logging
import logging.handlers
import os
from datetime import datetime

def setup_logger(log_dir='logs', log_level=logging.INFO):
    """
    Setup application logging
    
    Args:
        log_dir: Directory for log files
        log_level: Logging level
    """
    
    # Create logs directory if it doesn't exist
    if not os.path.exists(log_dir):
        os.makedirs(log_dir)
    
    # Create logger
    logger = logging.getLogger()
    logger.setLevel(log_level)
    
    # Log file path
    log_file = os.path.join(log_dir, f'yaris-cockpit-{datetime.now().strftime("%Y%m%d-%H%M%S")}.log')
    
    # File handler (rotating)
    file_handler = logging.handlers.RotatingFileHandler(
        log_file,
        maxBytes=10*1024*1024,  # 10MB
        backupCount=5
    )
    file_handler.setLevel(logging.DEBUG)
    
    # Console handler
    console_handler = logging.StreamHandler()
    console_handler.setLevel(logging.INFO)
    
    # Formatter
    formatter = logging.Formatter(
        '%(asctime)s - %(name)s - %(levelname)s - %(message)s',
        datefmt='%Y-%m-%d %H:%M:%S'
    )
    
    file_handler.setFormatter(formatter)
    console_handler.setFormatter(formatter)
    
    # Add handlers
    logger.addHandler(file_handler)
    logger.addHandler(console_handler)
    
    logger.info(f"Logging initialized - Log file: {log_file}")
