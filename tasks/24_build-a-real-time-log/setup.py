from setuptools import setup, find_packages

setup(
    name="logstream",
    version="1.0.0",
    description="Real-time log aggregation and analysis system",
    author="LogStream Team",
    packages=find_packages(),
    install_requires=[
        "click>=8.1.0",
        "rich>=13.0.0",
        "pandas>=2.0.0",
        "numpy>=1.24.0",
        "watchdog>=3.0.0",
        "python-dateutil>=2.8.0",
        "pyyaml>=6.0.0",
        "plotext>=5.2.0",
        "regex>=2023.0.0",
    ],
    entry_points={
        "console_scripts": [
            "logstream=logstream.cli:main",
        ],
    },
    python_requires=">=3.9",
)
