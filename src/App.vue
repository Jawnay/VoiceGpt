<script setup>
import { ref } from 'vue'
import { useAVLine } from 'vue-audio-visual'
import axios from 'axios';

const player =  ref (null)
const canvas =  ref (null)
let mySource =  ref (null)
let action = ref('')
let output = ref('')

useAVLine(player, canvas, { src: mySource, canvHeight: 300, canvWidth: 1000, barColor: 'lime' })



const runSpeechRecognition = () => {
    var SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    var recognition = new SpeechRecognition();


    recognition.onstart = () => { action.value = "listening, please ask your question..." };
    
    recognition.onspeechend = () => {
        action.value = "stopped listening...";
        recognition.stop();
    }

    recognition.onresult = async (event) => {
        var transcript = event.results[0][0].transcript;
        output.value = transcript

        try {
            let res = await axios.post(import.meta.env.VITE_APP_SERVER_URL + '/api/text-to-audio-file', {
            text: event.results[0][0].transcript
        })
        console.log(res);
        if (res.data) {
            mySource.value = import.meta.env.VITE_APP_SERVER_URL +'/api/proxy-audio/' + res.data;
            // Check if the audio element exists and the source is set
            if (player.value && mySource.value) {
                
                setTimeout(() => { player.value.play(); }, 1000); // Delay play to ensure load completes
                
            }
        }

        } catch (err) {
            console.error(err)
        }
    };
    recognition.start();
}

</script>

<template>
    <div class="btn-section">
        <button type="button" class= "hoverable-button" @click="runSpeechRecognition()">Ask question</button>
    </div>

    <div class="display-section">
        <div class="action" v-if = "action">{{ action }}</div>
        <div class="output" v-if = "output"><b>Question</b>:{{ output }}></div>
    </div>

    <div>
    <audio id="player" ref="player" :src="mySource" type="audio/mpeg" controls hidden></audio>
    <canvas ref="canvas" />
    </div>


</template>

<style>
    
    body{
        background-color: #222222
    }

    button{
        padding: 10px 13px;
        border-radius: 8px;
        border:2px solid black;
        background-color: lime;
        color:white;
        transition-duration: 0.4s;
    }

    .hoverable-button:hover {
        background-color: white;
        color: lime;
    }


    .btn-section{
        display:flex;
        justify-content: center;
        margin-top:30px
    }
    
    canvas {
        padding: 0;
        margin: auto;
        display: block;
        width: 800px;
        position: absolute;
        left:0;
        right:0;
        top: 0;
        bottom:0;
    }
    .display-section{
        color: white;
        width: 100%;
        text-align: center;
    }
    .action {
    margin-top: 10px;
    margin-bottom: 10px;
    }
    .output {
    max-width: 500px;
    padding: 20px;
    border-radius: 10px;
    border: 1px dotted white;
    display: inline-block;
    }

</style>
