from setuptools import setup, find_packages

setup(
    name="fieldkit-sdk",
    version="1.0.0",
    description="The Python SDK and Runtime Engine for FieldKit Physical AI Operating Framework",
    author="1nc0gn30",
    author_email="dev@nullai.tech",
    url="https://github.com/NullAITech/fieldkit",
    license="MIT",
    packages=find_packages(),
    install_requires=[
        "pyyaml>=6.0",
        "cryptography>=42.0.0"
    ],
    classifiers=[
        "Development Status :: 4 - Beta",
        "Intended Audience :: Developers",
        "License :: OSI Approved :: MIT License",
        "Programming Language :: Python :: 3",
        "Programming Language :: Python :: 3.10",
        "Programming Language :: Python :: 3.11",
        "Programming Language :: Python :: 3.12",
        "Topic :: Scientific/Engineering :: Artificial Intelligence",
        "Topic :: System :: Hardware"
    ],
    python_requires=">=3.9"
)
