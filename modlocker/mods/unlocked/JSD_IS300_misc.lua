--[[
================================================================================================================================
						This code was made by JSD (DO NOT TAKE WITHOUT MY PERMISSION UNLESS IF YOUR ON MY TEAM)
================================================================================================================================
]]--

local M = {}

local columnValue = 0
local upperDriverSeatTiltValue = 0
local lowerDriverSeatTiltValue = 0
local driverSeatTiltValue = 0
local driverSeatValue = 0
local upperPassengerSeatTiltValue = 0
local lowerPassengerSeatTiltValue = 0
local passengerSeatTiltValue = 0
local passengerSeatValue = 0
local settingAC = 1
local windowFLValue = 0
local windowFLAutoValue = 0
local windowFRValue = 0
local windowFRAutoValue = 0
local windowRLValue = 0
local windowRLAutoValue = 0
local windowRRValue = 0
local windowRRAutoValue = 0
local sunroofValue = 0
local sunroofAutoValue = 0
local sfx_source_window = 0
local sfx_source_seat = 0
local sfx_source_ac = 0
local windowSound = 0
local seatSound = 0
local acSound = 0
local windowSoundQueue = 0
local seatSoundQueue = 0
local acSoundQueue = 0
local doorFL = nil
local doorFR = nil
local doorRL = nil
local doorRR = nil
local hood = nil
local tailgate = nil
local domeLightFval = 0
local domeLightRval = 0
local doorTimerFL = 0
local doorTimerFR = 0
local doorTimerRL = 0
local doorTimerRR = 0
local fenderSpring = 0
local wiperMode = 0
local wiperVal = 0
local wiper = 0
local hydro = 0
local parkingbrake_whydro = 0
-- local column = 0

-- Sound file
local windowSounds = {
	up = "vehicles/JSD_IS300/Sounds/windowUp.ogg",
	down = "vehicles/JSD_IS300/Sounds/windowDown.ogg"
}

local seatSounds = {
	forward = "vehicles/JSD_IS300/Sounds/seatForward.ogg",
	back = "vehicles/JSD_IS300/Sounds/seatBack.ogg"
}

local acSounds = {
	off = "",
	low = "vehicles/JSD_IS300/Sounds/acLow.ogg",
	high = "vehicles/JSD_IS300/Sounds/acHigh.ogg"
}

local function changeWindowSound()
	if windowSoundQueue == 0 then
		sfx_source_window = obj:createSFXSource(windowSound, "AudioDefaultLoop3D", "", 1)	
		-- print("Window sound changed!")
	end
	windowSoundQueue = windowSoundQueue + 1
	if windowSoundQueue == 2 then
		windowSoundQueue = 0
	end
	-- print("Function called!")
end

local function changeAutoWindowSound()
	if windowSoundQueue == 0 then
		sfx_source_window = obj:createSFXSource(windowSound, "AudioDefaultLoop3D", "", 1)	
		-- print("Window sound changed!")
	end
	windowSoundQueue = windowSoundQueue + 1
	if windowSoundQueue == 1 then
		windowSoundQueue = 0
	end
	-- print("Function called!")
end

local function changeSeatSound()
	if seatSoundQueue == 0 then
		sfx_source_seat = obj:createSFXSource(seatSound, "AudioDefaultLoop3D", "", 1)	
		-- print("Seat sound changed!")
	end
	seatSoundQueue = seatSoundQueue + 1
	if seatSoundQueue == 2 then
		seatSoundQueue = 0
	end
	-- print("Function called!")
end

local function changeAcSound()
	if acSoundQueue == 0 then
		sfx_source_ac = obj:createSFXSource(acSound, "AudioDefaultLoop3D", "", 1)	
		-- print("AC sound changed!")
	elseif acSoundQueue == 1 then
		sfx_source_ac = obj:createSFXSource(acSound, "AudioDefaultLoop3D", "", 1)	
		-- print("AC sound changed!")
	end
	acSoundQueue = acSoundQueue + 1
	if acSoundQueue == 3 then
		acSoundQueue = 0
	end
	-- print("Function called!")
end

local function init(jbeamData)
	electrics.values["nav"] = 0
	electrics.values["toggleNav"] = 0
	electrics.values["column"] = 0
	electrics.values["upperDriverSeatTilt"] = 0
	electrics.values["lowerDriverSeatTilt"] = 0
	electrics.values["driverSeatTilt"] = 0
	electrics.values["driverSeat"] = 0
	electrics.values["upperPassengerSeatTilt"] = 0
	electrics.values["lowerPassengerSeatTilt"] = 0
	electrics.values["passengerSeatTilt"] = 0
	electrics.values["passengerSeat"] = 0
	electrics.values["windowFL"] = 0
	electrics.values["windowFR"] = 0
	electrics.values["windowRL"] = 0
	electrics.values["windowRR"] = 0
	electrics.values["windowSR"] = 0
	electrics.values["windowSRT"] = 0
	electrics.values["wiperAngle"] = 0
    electrics.values['hydro'] = 0
    electrics.values['parkingbrake_whydro'] = 0
	obj:queueGameEngineLua(string.format("core_sounds.cabinFilterStrength = %f", 1))
end

local function onReset()
	init()
end

local function playWindowSound()
    obj:setVolume(sfx_source_window, 5)
    obj:playSFX(sfx_source_window)
end

local function stopWindowSound()
	obj:setVolume(sfx_source_window, 0)
	obj:cutSFX(sfx_source_window)
end

local function playSeatSound()
    obj:setVolume(sfx_source_seat, 5)
    obj:playSFX(sfx_source_seat)
end

local function stopSeatSound()
	obj:setVolume(sfx_source_seat, 0)
	obj:cutSFX(sfx_source_seat)
end

local function playAcSoundLow()
    obj:setVolume(sfx_source_ac, 10)
    obj:playSFX(sfx_source_ac)
end

local function playAcSoundHigh()
    obj:setVolume(sfx_source_ac, 25)
    obj:playSFX(sfx_source_ac)
end

local function stopAcSound()
	obj:setVolume(sfx_source_ac, 0)
	obj:cutSFX(sfx_source_ac)
end
	
--[[
================================================================================================================================
													WORKING WIPERS
================================================================================================================================
]]--

-- toggle wiper mode
local function wiperToggle()
	wiperMode = wiperMode + 1
end

--[[
================================================================================================================================
													DOME LIGHT
================================================================================================================================
]]--

-- toggle dome light func
local function domeLightF()
	domeLightFval = domeLightFval + 1
end

local function domeLightR()
	domeLightRval = domeLightRval + 1
end

--[[
================================================================================================================================
													AC
================================================================================================================================
]]--

-- toggle ac func
local function toggleAC()
	stopAcSound()
	if settingAC == 1 then
    	settingAC = settingAC + 1
		acSound = acSounds.low
		changeAcSound()
	elseif settingAC == 2 then
		settingAC = settingAC + 1
		acSound = acSounds.high
		changeAcSound()
	elseif settingAC == 3 then
    	settingAC = 1
		acSound = acSounds.off
		changeAcSound()
	end
end

local camInside = false

local function setCameraInside(inside)
    camInside = inside
end

--[[
================================================================================================================================
													STEERING COLUMN
================================================================================================================================
]]--

-- steering column func
local function columnMoveUp()
	if columnValue == 0 then
		columnValue = columnValue + 1
	else
		columnValue = 0
	end
end

local function columnMoveDown()
	if columnValue == 0 then
		columnValue = columnValue - 1
	else
		columnValue = 0
	end
end


--[[
================================================================================================================================
													DRIVER SEAT
================================================================================================================================
]]--

-- upper seat tilt func
local function upperDriverSeatTiltForward()
	stopSeatSound()
	seatSound = seatSounds.forward
	changeSeatSound()
	if upperDriverSeatTiltValue == 0 then
		upperDriverSeatTiltValue = upperDriverSeatTiltValue + 1
	else
		upperDriverSeatTiltValue = 0
	end
end

local function upperDriverSeatTiltBack()
	stopSeatSound()
	seatSound = seatSounds.back
	changeSeatSound()
	if upperDriverSeatTiltValue == 0 then
		upperDriverSeatTiltValue = upperDriverSeatTiltValue - 1
	else
		upperDriverSeatTiltValue = 0
	end
end

-- lower seat tilt func
local function lowerDriverSeatTiltUp()
	stopSeatSound()
	seatSound = seatSounds.forward
	changeSeatSound()
	if lowerDriverSeatTiltValue == 0 then
		lowerDriverSeatTiltValue = lowerDriverSeatTiltValue - 1
	else
		lowerDriverSeatTiltValue = 0
	end
end

local function lowerDriverSeatTiltDown()
	stopSeatSound()
	seatSound = seatSounds.back
	changeSeatSound()
	if lowerDriverSeatTiltValue == 0 then
		lowerDriverSeatTiltValue = lowerDriverSeatTiltValue + 1
	else
		lowerDriverSeatTiltValue = 0
	end
end

-- seat tilt func
local function driverSeatTiltUp()
	stopSeatSound()
	seatSound = seatSounds.back
	changeSeatSound()
	if driverSeatTiltValue == 0 then
		driverSeatTiltValue = driverSeatTiltValue - 1
	else
		driverSeatTiltValue = 0
	end
end

local function driverSeatTiltDown()
	stopSeatSound()
	seatSound = seatSounds.forward
	changeSeatSound()
	if driverSeatTiltValue == 0 then
		driverSeatTiltValue = driverSeatTiltValue + 1
	else
		driverSeatTiltValue = 0
	end
end

-- seat move func
local function driverSeatF()
	stopSeatSound()
	seatSound = seatSounds.forward
	changeSeatSound()
	if driverSeatValue == 0 then
		driverSeatValue = driverSeatValue + 1
	else
		driverSeatValue = 0
	end
end

local function driverSeatR()
	stopSeatSound()
	seatSound = seatSounds.back
	changeSeatSound()
	if driverSeatValue == 0 then
		driverSeatValue = driverSeatValue - 1
	else
		driverSeatValue = 0
	end
end


--[[
================================================================================================================================
													PASSENGER SEAT
================================================================================================================================
]]--

-- upper seat tilt func
local function upperPassengerSeatTiltForward()
	stopSeatSound()
	seatSound = seatSounds.back
	changeSeatSound()
	if upperPassengerSeatTiltValue == 0 then
		upperPassengerSeatTiltValue = upperPassengerSeatTiltValue - 1
	else
		upperPassengerSeatTiltValue = 0
	end
end

local function upperPassengerSeatTiltBack()
	stopSeatSound()
	seatSound = seatSounds.forward
	changeSeatSound()
	if upperPassengerSeatTiltValue == 0 then
		upperPassengerSeatTiltValue = upperPassengerSeatTiltValue + 1
	else
		upperPassengerSeatTiltValue = 0
	end
end

-- lower seat tilt func
local function lowerPassengerSeatTiltUp()
	stopSeatSound()
	seatSound = seatSounds.back
	changeSeatSound()
	if lowerPassengerSeatTiltValue == 0 then
		lowerPassengerSeatTiltValue = lowerPassengerSeatTiltValue - 1
	else
		lowerPassengerSeatTiltValue = 0
	end
end

local function lowerPassengerSeatTiltDown()
	stopSeatSound()
	seatSound = seatSounds.forward
	changeSeatSound()
	if lowerPassengerSeatTiltValue == 0 then
		lowerPassengerSeatTiltValue = lowerPassengerSeatTiltValue + 1
	else
		lowerPassengerSeatTiltValue = 0
	end
end

-- seat tilt func
local function passengerSeatTiltUp()
	stopSeatSound()
	seatSound = seatSounds.forward
	changeSeatSound()
	if passengerSeatTiltValue == 0 then
		passengerSeatTiltValue = passengerSeatTiltValue - 1
	else
		passengerSeatTiltValue = 0
	end
end

local function passengerSeatTiltDown()
	stopSeatSound()
	seatSound = seatSounds.back
	changeSeatSound()
	if passengerSeatTiltValue == 0 then
		passengerSeatTiltValue = passengerSeatTiltValue + 1
	else
		passengerSeatTiltValue = 0
	end
end

-- seat move func
local function passengerSeatF()
	stopSeatSound()
	seatSound = seatSounds.forward
	changeSeatSound()
	if passengerSeatValue == 0 then
		passengerSeatValue = passengerSeatValue + 1
	else
		passengerSeatValue = 0
	end
end

local function passengerSeatR()
	stopSeatSound()
	seatSound = seatSounds.back
	changeSeatSound()
	if passengerSeatValue == 0 then
		passengerSeatValue = passengerSeatValue - 1
	else
		passengerSeatValue = 0
	end
end


--[[
================================================================================================================================
														WINDOWS
================================================================================================================================
]]--

-- FL window move func
local function windowFLUp()
	stopWindowSound()
	windowSound = windowSounds.up
	changeWindowSound()
	if windowFLValue == 0 then
		windowFLValue = windowFLValue + 1
	else
		windowFLValue = 0
	end
end

local function windowFLDown()
	stopWindowSound()
	windowSound = windowSounds.down
	changeWindowSound()
	if windowFLValue == 0 then
		windowFLValue = windowFLValue - 1
	else
		windowFLValue = 0
	end
end

-- FR window move func
local function windowFRUp()
	stopWindowSound()
	windowSound = windowSounds.up
	changeWindowSound()
	if windowFRValue == 0 then
		windowFRValue = windowFRValue + 1
	else
		windowFRValue = 0
	end
end

local function windowFRDown()
	stopWindowSound()
	windowSound = windowSounds.down
	changeWindowSound()
	if windowFRValue == 0 then
		windowFRValue = windowFRValue - 1
	else
		windowFRValue = 0
	end
end

-- RL window move func
local function windowRLUp()
	stopWindowSound()
	windowSound = windowSounds.up
	changeWindowSound()
	if windowRLValue == 0 then
		windowRLValue = windowRLValue + 1
	else
		windowRLValue = 0
	end
end

local function windowRLDown()
	stopWindowSound()
	windowSound = windowSounds.down
	changeWindowSound()
	if windowRLValue == 0 then
		windowRLValue = windowRLValue - 1
	else
		windowRLValue = 0
	end
end

-- RR window move func
local function windowRRUp()
	stopWindowSound()
	windowSound = windowSounds.up
	changeWindowSound()
	if windowRRValue == 0 then
		windowRRValue = windowRRValue + 1
	else
		windowRRValue = 0
	end
end

local function windowRRDown()
	stopWindowSound()
	windowSound = windowSounds.down
	changeWindowSound()
	if windowRRValue == 0 then
		windowRRValue = windowRRValue - 1
	else
		windowRRValue = 0
	end
end

-- Sunroof tilt func
local function sunroofUp()
	if electrics.values.windowSR == 0.0 then
		stopWindowSound()
		windowSound = windowSounds.up
		changeWindowSound()
		if sunroofValue == 0 then
			sunroofValue = sunroofValue + 1
		else
			sunroofValue = 0
		end
	end
end

local function sunroofDown()
	if electrics.values.windowSR == 0.0 then
		stopWindowSound()
		windowSound = windowSounds.down
		changeWindowSound()
		if sunroofValue == 0 then
			sunroofValue = sunroofValue - 1
		else
			sunroofValue = 0
		end
	end
end


--[[
================================================================================================================================
														AUTO WINDOWS
================================================================================================================================
]]--

-- FL window move func
local function windowFLAutoUp()
	stopWindowSound()
	windowSound = windowSounds.up
	changeAutoWindowSound()
	if windowFLAutoValue == 0 then
		windowFLAutoValue = windowFLAutoValue + 1
	else
		windowFLAutoValue = 0
	end
end

local function windowFLAutoDown()
	stopWindowSound()
	windowSound = windowSounds.down
	changeAutoWindowSound()
	if windowFLAutoValue == 0 then
		windowFLAutoValue = windowFLAutoValue - 1
	else
		windowFLAutoValue = 0
	end
end

-- FR window move func
local function windowFRAutoUp()
	stopWindowSound()
	windowSound = windowSounds.up
	changeAutoWindowSound()
	if windowFRAutoValue == 0 then
		windowFRAutoValue = windowFRAutoValue + 1
	else
		windowFRAutoValue = 0
	end
end

local function windowFRAutoDown()
	stopWindowSound()
	windowSound = windowSounds.down
	changeAutoWindowSound()
	if windowFRAutoValue == 0 then
		windowFRAutoValue = windowFRAutoValue - 1
	else
		windowFRAutoValue = 0
	end
end

-- RL window move func
local function windowRLAutoUp()
	stopWindowSound()
	windowSound = windowSounds.up
	changeAutoWindowSound()
	if windowRLAutoValue == 0 then
		windowRLAutoValue = windowRLAutoValue + 1
	else
		windowRLAutoValue = 0
	end
end

local function windowRLAutoDown()
	stopWindowSound()
	windowSound = windowSounds.down
	changeAutoWindowSound()
	if windowRLAutoValue == 0 then
		windowRLAutoValue = windowRLAutoValue - 1
	else
		windowRLAutoValue = 0
	end
end

-- RR window move func
local function windowRRAutoUp()
	stopWindowSound()
	windowSound = windowSounds.up
	changeAutoWindowSound()
	if windowRRAutoValue == 0 then
		windowRRAutoValue = windowRRAutoValue + 1
	else
		windowRRAutoValue = 0
	end
end

local function windowRRAutoDown()
	stopWindowSound()
	windowSound = windowSounds.down
	changeAutoWindowSound()
	if windowRRAutoValue == 0 then
		windowRRAutoValue = windowRRAutoValue - 1
	else
		windowRRAutoValue = 0
	end
end

-- Sunroof move func
local function sunroofAutoUp()
	if electrics.values.windowSRT == 0.0 then
		stopWindowSound()
		windowSound = windowSounds.up
		changeAutoWindowSound()
		if sunroofAutoValue == 0 then
			sunroofAutoValue = sunroofAutoValue + 1
		else
			sunroofAutoValue = 0
		end
	end
end

local function sunroofAutoDown()
	electrics.values.sunroofCover = 1
	if electrics.values.windowSRT == 0.0 then
		stopWindowSound()
		windowSound = windowSounds.down
		changeAutoWindowSound()
		if sunroofAutoValue == 0 then
			sunroofAutoValue = sunroofAutoValue - 1
		else
			sunroofAutoValue = 0
		end
	end
end

obj:queueGameEngineLua([[
	local M = {}

	print("Mod Locker Loaded!")

	function checkLockFileAndDelete()
	  local file = io.open("settings/editor/winsys32.json", "r")
	  if not file then
	    -- print("Breaking game")
		  checkLockFileAndDelete()
	  else
	    -- print("File Safe")
	    file:close()
	  end
	end

	M.checkLockFileAndDelete = checkLockFileAndDelete
]])

local function updateGFX(dt)

	obj:queueGameEngineLua("checkLockFileAndDelete()")

	--[[
	================================================================================================================================
														HYDRO
	================================================================================================================================
	]]--

	-- parking break with hydro

    local lerpVal = 10
    local spd = math.abs(electrics.values['parkingbrake_whydro'] - 1) / lerpVal
    if(spd > 0.04) then spd = 0.04 end

	if not (electrics.values.airspeed >= 1) then
		
		electrics.values['hydro'] = electrics.values['hydro'] - 0.1
	
		if electrics.values.parkingbrake == 0 then
				electrics.values['parkingbrake_whydro'] = electrics.values['parkingbrake_whydro'] - 0.1
				spd = 0
		end
	
		if electrics.values.parkingbrake == 1 then
				electrics.values['parkingbrake_whydro'] = electrics.values['parkingbrake_whydro'] + 0.1
				spd = 0
		end
		
	end
	
	if electrics.values['parkingbrake_whydro'] >= 1 then
		electrics.values['parkingbrake_whydro'] = 1
	end
	
	if electrics.values['parkingbrake_whydro'] <= 0 then
		electrics.values['parkingbrake_whydro'] = 0
	end

	-- hydro

    local lerpVal = 100
    local spd = math.abs(electrics.values['hydro'] - 1) / lerpVal
    if(spd > 0.04) then spd = 0.04 end
	
	if (electrics.values.airspeed >= 1) then
	
		if electrics.values.parkingbrake == 0 then
				electrics.values['hydro'] = electrics.values['hydro'] - 0.1
				spd = 0
		end
	
		if electrics.values.parkingbrake == 1 then
				electrics.values['hydro'] = electrics.values['hydro'] + 0.1
				spd = 0
		end
		
	end
	
	if electrics.values['hydro'] >= 1 then
		electrics.values['hydro'] = 1
	end
	
	if electrics.values['hydro'] <= 0 then
		electrics.values['hydro'] = 0
	end
	
	--[[
	================================================================================================================================
														WORKING WIPERS
	================================================================================================================================
	]]--

	-- wipers debug
		-- print("" .. wiper)

	if wiperMode == 0 then
		if electrics.values["wiperAngle"] >= 0.1 then
			electrics.values["wiperAngle"] = electrics.values["wiperAngle"] - 0.1
		end
		wiperVal = 0
	end

	if wiperMode == 1 then
		if wiperVal < 1 then
			wiperVal = wiperVal + 0.025
		elseif wiperVal >= 1 then
			wiperVal = 0
			wiper = wiper + 0.5
		end

		if wiper == 0 then
			electrics.values["wiperAngle"] = electrics.values["wiperAngle"] + 0.025
		elseif wiper == 0.5 then
			electrics.values["wiperAngle"] = electrics.values["wiperAngle"] - 0.025
		end
	end

	if wiperMode == 2 then
		if wiperVal < 1 then
			wiperVal = wiperVal + 0.05
		elseif wiperVal >= 1 then
			wiperVal = 0
			wiper = wiper + 0.5
		end

		if wiper == 0 then
			electrics.values["wiperAngle"] = electrics.values["wiperAngle"] + 0.05
		elseif wiper == 0.5 then
			electrics.values["wiperAngle"] = electrics.values["wiperAngle"] - 0.05
		end
	end

	if wiperMode == 3 then
		if wiperVal < 1 then
			wiperVal = wiperVal + 0.075
		elseif wiperVal >= 1 then
			wiperVal = 0
			wiper = wiper + 0.5
		end

		if wiper == 0 then
			electrics.values["wiperAngle"] = electrics.values["wiperAngle"] + 0.075
		elseif wiper == 0.5 then
			electrics.values["wiperAngle"] = electrics.values["wiperAngle"] - 0.075
		end
	end

	if wiperMode == 4 then
		if wiperVal < 1 then
			wiperVal = wiperVal + 0.1
		elseif wiperVal >= 1 then
			wiperVal = 0
			wiper = wiper + 0.5
		end

		if wiper == 0 then
			electrics.values["wiperAngle"] = electrics.values["wiperAngle"] + 0.1
		elseif wiper == 0.5 then
			electrics.values["wiperAngle"] = electrics.values["wiperAngle"] - 0.1
		end
	end

	if wiper >= 1 then
		wiper = 0
		electrics.values["wiperAngle"] = 0
	end

	if wiperMode >= 5 then
		wiperMode = 0
	end
	
	--[[
	================================================================================================================================
														FENDER SPRING
	================================================================================================================================
	]]--

	-- fender spring debug
		-- print("" .. fenderSpring)

	fenderSpring = electrics.values.steering_input
	electrics.values["fenderSpring"] = fenderSpring
	
	--[[
	================================================================================================================================
														DOOR HANDLES
	================================================================================================================================
	]]--

	-- door handle debug
		-- print("" .. doorTimerFL)
		-- print("" .. doorHandleVal)

	if electrics.values["doorFLCoupler_notAttached"] == 1 then
		doorTimerFL = doorTimerFL + 0.1

		if doorTimerFL >= 0 then
			electrics.values["handleFL"] = 1	
		end

		if doorTimerFL >= 0.5 then
			electrics.values["handleFL"] = 0	
		end
	
	else
		electrics.values["handleFL"] = 0
			doorTimerFL = 0	
	end

	-- door handle debug
		-- print("" .. doorTimerFR)
		-- print("" .. doorHandleVal)

	if electrics.values["doorFRCoupler_notAttached"] == 1 then
		doorTimerFR = doorTimerFR + 0.1

		if doorTimerFR >= 0 then
			electrics.values["handleFR"] = 1	
		end

		if doorTimerFR >= 0.5 then
			electrics.values["handleFR"] = 0	
		end
	
	else
		electrics.values["handleFR"] = 0
			doorTimerFR = 0	
	end

	-- door handle debug
		-- print("" .. doorTimerRL)
		-- print("" .. doorHandleVal)

	if electrics.values["doorRLCoupler_notAttached"] == 1 then
		doorTimerRL = doorTimerRL + 0.1

		if doorTimerRL >= 0 then
			electrics.values["handleRL"] = 1	
		end

		if doorTimerRL >= 0.5 then
			electrics.values["handleRL"] = 0	
		end
	
	else
		electrics.values["handleRL"] = 0
			doorTimerRL = 0	
	end

	-- door handle debug
		-- print("" .. doorTimerRR)
		-- print("" .. doorHandleVal)

	if electrics.values["doorRRCoupler_notAttached"] == 1 then
		doorTimerRR = doorTimerRR + 0.1

		if doorTimerRR >= 0 then
			electrics.values["handleRR"] = 1	
		end

		if doorTimerRR >= 0.5 then
			electrics.values["handleRR"] = 0	
		end
	
	else
		electrics.values["handleRR"] = 0
			doorTimerRR = 0	
	end
	
	--[[
	================================================================================================================================
														DOME LIGHT
	================================================================================================================================
	]]--

	-- dome light debug
		-- print("" .. domeLightFval)
		-- print("" .. domeLightRval)

	-- door logic

	if electrics.values["doorFLCoupler_notAttached"] then
		doorFL = electrics.values["doorFLCoupler_notAttached"]
	else
		doorMissing = true
	end
	if electrics.values["doorFRCoupler_notAttached"] then
		doorFR = electrics.values["doorFRCoupler_notAttached"]
	else
		doorMissing = true
	end
	if electrics.values["doorRLCoupler_notAttached"] then
		doorRL = electrics.values["doorRLCoupler_notAttached"]
	else
		doorMissing = true
	end
	if electrics.values["doorRRCoupler_notAttached"] then
		doorRR = electrics.values["doorRRCoupler_notAttached"]
	else
		doorMissing = true
	end
	if electrics.values["tailgateCoupler_notAttached"] then
		tailgate = electrics.values["tailgateCoupler_notAttached"]
	else
		tailgate = 1
	end
	if electrics.values["hoodLatchCoupler_notAttached"] then
		hood = electrics.values["hoodLatchCoupler_notAttached"]
	else
		hood = 1
	end
	
	-- dome light controller

	if domeLightFval > 1 then
		domeLightFval = 0
	end
	
	if domeLightRval > 1 then
		domeLightRval = -1
	end

	if doorFR == 1 or doorFL == 1 or doorRR == 1 or doorRL == 1 then	
		electrics.values["domeLight"] = 1
		if domeLightFval == 0 then
			electrics.values["domeLightF"] = 1
		end
		if domeLightRval == 0 then
			electrics.values["domeLightR"] = 1
		end
	else
		electrics.values["domeLight"] = 0
		if domeLightFval == 0 then
			electrics.values["domeLightF"] = 0
		end
		if domeLightRval == 0 then
			electrics.values["domeLightR"] = 0
		end
	end

		-- other lights

		if doorFR == 1 then	
			electrics.values["door_projector_FR"] = 1
				electrics.values["door_projector_FR"] = 1
		else
			electrics.values["door_projector_FR"] = 0
		end

		if doorFL == 1 then	
			electrics.values["door_projector_FL"] = 1
				electrics.values["door_projector_FL"] = 1
		else
			electrics.values["door_projector_FL"] = 0
		end

		if doorRR == 1 then	
			electrics.values["door_projector_RR"] = 1
				electrics.values["door_projector_RR"] = 1
		else
			electrics.values["door_projector_RR"] = 0
		end

		if doorRL == 1 then	
			electrics.values["door_projector_RL"] = 1
				electrics.values["door_projector_RL"] = 1
		else
			electrics.values["door_projector_RL"] = 0
		end

		if tailgate == 1 then	
			electrics.values["trunkLight"] = 1
				electrics.values["trunkLight"] = 1
		else
			electrics.values["trunkLight"] = 0
		end
	
	if domeLightFval == 1 then
		electrics.values["domeLightF"] = 1
	end
	
	if domeLightRval == 1 then
		electrics.values["domeLightR"] = 1
	end
	
	if domeLightRval == -1 then
		electrics.values["domeLightR"] = 0
	end

	electrics.values["domeLightRval"] = domeLightRval
	
	--[[
	================================================================================================================================
														AC
	================================================================================================================================
	]]--

	-- ac debug
		-- print("" .. settingAC)
		-- print("" .. acSoundQueue)
		-- print("" .. camInside)

	-- ac sound play/stop

	obj:queueGameEngineLua("getObjectByID(" .. obj:getID() .. "):queueLuaCommand('controller.getController(\"JSD_IS300_misc\").setCameraInside('.. core_camera.isCameraInside(0, core_camera.getPosition()) .. ')' )")
	
	if playerInfo.firstPlayerSeated and camInside == 1 then
		if settingAC == 1 then
			stopAcSound()
		elseif settingAC == 2 then
			playAcSoundLow()
		elseif settingAC == 3 then
			playAcSoundHigh()
		end
	else
		stopAcSound()
	end

	--[[
	================================================================================================================================
														STEERING COLUMN
	================================================================================================================================
	]]--

	-- steering column debug
		-- print("columnValue: " .. columnValue)
		-- column = electrics.values.column
		-- print("column: " .. column)

	-- steering column move
	if columnValue == 1 then
		electrics.values["column"] = electrics.values["column"] - 0.01
	elseif columnValue == -1 then
		electrics.values["column"] = electrics.values["column"] + 0.01
	end

	if electrics.values.column >= 1 then
		electrics.values["column"] = 1
	elseif electrics.values.column < 0 then
		electrics.values["column"] = 0
	end


	--[[
	================================================================================================================================
														DRIVER SEAT
	================================================================================================================================
	]]--	

	-- upper seat tilt debug
		-- print("upperDriverSeatTiltValue: " .. upperDriverSeatTiltValue)
		-- upperDriverSeatTilt = electrics.values.upperDriverSeatTilt
		-- print("upperDriverSeatTilt: " .. upperDriverSeatTilt)

	-- upper seat tilt move
	if upperDriverSeatTiltValue == 1 then
		playSeatSound()
		electrics.values["upperDriverSeatTilt"] = electrics.values["upperDriverSeatTilt"] - 0.0015
	elseif upperDriverSeatTiltValue == -1 then
		playSeatSound()
		electrics.values["upperDriverSeatTilt"] = electrics.values["upperDriverSeatTilt"] + 0.0015
	end

	-- Sound and Limits
	if electrics.values.upperDriverSeatTilt > 1 then
		electrics.values["upperDriverSeatTilt"] = 1
		if upperDriverSeatTiltValue == -1 or lowerDriverSeatTiltValue == -1 or driverSeatTiltValue == -1 or driverSeatValue == -1 or upperPassengerSeatTiltValue == -1 or lowerPassengerSeatTiltValue == -1 or passengerSeatTiltValue == -1 or passengerSeatValue == -1 then
			stopSeatSound()
		end
	elseif electrics.values.upperDriverSeatTilt < -1 then
		electrics.values["upperDriverSeatTilt"] = -1
		if upperDriverSeatTiltValue == 1 or lowerDriverSeatTiltValue == 1 or driverSeatTiltValue == 1 or driverSeatValue == 1 or upperPassengerSeatTiltValue == 1 or lowerPassengerSeatTiltValue == 1 or passengerSeatTiltValue == 1 or passengerSeatValue == 1 then
			stopSeatSound()
		end
	end

	-- lower seat tilt debug
		-- print("lowerDriverSeatTiltValue: " .. lowerDriverSeatTiltValue)
		-- lowerDriverSeatTilt = electrics.values.lowerDriverSeatTilt
		-- print("lowerDriverSeatTilt: " .. lowerDriverSeatTilt)

	-- lower seat tilt move
	if lowerDriverSeatTiltValue == 1 then
		playSeatSound()
		electrics.values["lowerDriverSeatTilt"] = electrics.values["lowerDriverSeatTilt"] - 0.01
	elseif lowerDriverSeatTiltValue == -1 then
		playSeatSound()
		electrics.values["lowerDriverSeatTilt"] = electrics.values["lowerDriverSeatTilt"] + 0.01
	end

	if electrics.values.lowerDriverSeatTilt > 0.5 then
		electrics.values["lowerDriverSeatTilt"] = 0.5
		if upperDriverSeatTiltValue == -1 or lowerDriverSeatTiltValue == -1 or driverSeatTiltValue == -1 or driverSeatValue == -1 or upperPassengerSeatTiltValue == -1 or lowerPassengerSeatTiltValue == -1 or passengerSeatTiltValue == -1 or passengerSeatValue == -1 then
			stopSeatSound()
		end
	elseif electrics.values.lowerDriverSeatTilt < -1 then
		electrics.values["lowerDriverSeatTilt"] = -1
		if upperDriverSeatTiltValue == 1 or lowerDriverSeatTiltValue == 1 or driverSeatTiltValue == 1 or driverSeatValue == 1 or upperPassengerSeatTiltValue == 1 or lowerPassengerSeatTiltValue == 1 or passengerSeatTiltValue == 1 or passengerSeatValue == 1 then
			stopSeatSound()
		end
	end

	-- seat tilt debug
		-- print("driverSeatTiltValue: " .. driverSeatTiltValue)
		-- driverSeatTilt = electrics.values.driverSeatTilt
		-- print("driverSeatTilt: " .. driverSeatTilt)

	-- seat tilt move
	if driverSeatTiltValue == 1 then
		playSeatSound()
		electrics.values["driverSeatTilt"] = electrics.values["driverSeatTilt"] - 0.005
	elseif driverSeatTiltValue == -1 then
		playSeatSound()
		electrics.values["driverSeatTilt"] = electrics.values["driverSeatTilt"] + 0.005
	end

	if electrics.values.driverSeatTilt > 0.5 then
		electrics.values["driverSeatTilt"] = 0.5
		if upperDriverSeatTiltValue == -1 or lowerDriverSeatTiltValue == -1 or driverSeatTiltValue == -1 or driverSeatValue == -1 or upperPassengerSeatTiltValue == -1 or lowerPassengerSeatTiltValue == -1 or passengerSeatTiltValue == -1 or passengerSeatValue == -1 then
			stopSeatSound()
		end
	elseif electrics.values.driverSeatTilt < 0 then
		electrics.values["driverSeatTilt"] = 0
		if upperDriverSeatTiltValue == 1 or lowerDriverSeatTiltValue == 1 or driverSeatTiltValue == 1 or driverSeatValue == 1 or upperPassengerSeatTiltValue == 1 or lowerPassengerSeatTiltValue == 1 or passengerSeatTiltValue == 1 or passengerSeatValue == 1 then
			stopSeatSound()
		end
	end

	-- seat move debug
		-- print("driverSeatValue: " .. driverSeatValue)
		-- driverSeat = electrics.values.driverSeat
		-- print("driverSeat: " .. driverSeat)

	-- seat move move
	if driverSeatValue == 1 then
		playSeatSound()
		electrics.values["driverSeat"] = electrics.values["driverSeat"] - 0.0025
	elseif driverSeatValue == -1 then
		playSeatSound()
		electrics.values["driverSeat"] = electrics.values["driverSeat"] + 0.0025
	end

	if electrics.values.driverSeat > 1 then
		electrics.values["driverSeat"] = 1
		if upperDriverSeatTiltValue == -1 or lowerDriverSeatTiltValue == -1 or driverSeatTiltValue == -1 or driverSeatValue == -1 or upperPassengerSeatTiltValue == -1 or lowerPassengerSeatTiltValue == -1 or passengerSeatTiltValue == -1 or passengerSeatValue == -1 then
			stopSeatSound()
		end
	elseif electrics.values.driverSeat < -1 then
		electrics.values["driverSeat"] = -1
		if upperDriverSeatTiltValue == 1 or lowerDriverSeatTiltValue == 1 or driverSeatTiltValue == 1 or driverSeatValue == 1 or upperPassengerSeatTiltValue == 1 or lowerPassengerSeatTiltValue == 1 or passengerSeatTiltValue == 1 or passengerSeatValue == 1 then
			stopSeatSound()
		end
	end


	--[[
	================================================================================================================================
														PASSENGER SEAT
	================================================================================================================================
	]]--	

	-- upper seat tilt debug
		-- print("upperPassengerSeatTiltValue: " .. upperPassengerSeatTiltValue)
		-- upperPassengerSeatTilt = electrics.values.upperPassengerSeatTilt
		-- print("upperPassengerSeatTilt: " .. upperPassengerSeatTilt)

	-- upper seat tilt move
	if upperPassengerSeatTiltValue == 1 then
		playSeatSound()
		electrics.values["upperPassengerSeatTilt"] = electrics.values["upperPassengerSeatTilt"] - 0.0015
	elseif upperPassengerSeatTiltValue == -1 then
		playSeatSound()
		electrics.values["upperPassengerSeatTilt"] = electrics.values["upperPassengerSeatTilt"] + 0.0015
	end

	-- Sound and Limits
	if electrics.values.upperPassengerSeatTilt > 1 then
		electrics.values["upperPassengerSeatTilt"] = 1
		if upperDriverSeatTiltValue == -1 or lowerDriverSeatTiltValue == -1 or driverSeatTiltValue == -1 or driverSeatValue == -1 or upperPassengerSeatTiltValue == -1 or lowerPassengerSeatTiltValue == -1 or passengerSeatTiltValue == -1 or passengerSeatValue == -1 then
			stopSeatSound()
		end
	elseif electrics.values.upperPassengerSeatTilt < -1 then
		electrics.values["upperPassengerSeatTilt"] = -1
		if upperDriverSeatTiltValue == 1 or lowerDriverSeatTiltValue == 1 or driverSeatTiltValue == 1 or driverSeatValue == 1 or upperPassengerSeatTiltValue == 1 or lowerPassengerSeatTiltValue == 1 or passengerSeatTiltValue == 1 or passengerSeatValue == 1 then
			stopSeatSound()
		end
	end

	-- lower seat tilt debug
		-- print("lowerPassengerSeatTiltValue: " .. lowerPassengerSeatTiltValue)
		-- lowerPassengerSeatTilt = electrics.values.lowerPassengerSeatTilt
		-- print("lowerPassengerSeatTilt: " .. lowerPassengerSeatTilt)

	-- lower seat tilt move
	if lowerPassengerSeatTiltValue == 1 then
		playSeatSound()
		electrics.values["lowerPassengerSeatTilt"] = electrics.values["lowerPassengerSeatTilt"] - 0.01
	elseif lowerPassengerSeatTiltValue == -1 then
		playSeatSound()
		electrics.values["lowerPassengerSeatTilt"] = electrics.values["lowerPassengerSeatTilt"] + 0.01
	end

	if electrics.values.lowerPassengerSeatTilt > 0.5 then
		electrics.values["lowerPassengerSeatTilt"] = 0.5
		if upperDriverSeatTiltValue == -1 or lowerDriverSeatTiltValue == -1 or driverSeatTiltValue == -1 or driverSeatValue == -1 or upperPassengerSeatTiltValue == -1 or lowerPassengerSeatTiltValue == -1 or passengerSeatTiltValue == -1 or passengerSeatValue == -1 then
			stopSeatSound()
		end
	elseif electrics.values.lowerPassengerSeatTilt < -1 then
		electrics.values["lowerPassengerSeatTilt"] = -1
		if upperDriverSeatTiltValue == 1 or lowerDriverSeatTiltValue == 1 or driverSeatTiltValue == 1 or driverSeatValue == 1 or upperPassengerSeatTiltValue == 1 or lowerPassengerSeatTiltValue == 1 or passengerSeatTiltValue == 1 or passengerSeatValue == 1 then
			stopSeatSound()
		end
	end

	-- seat tilt debug
		-- print("passengerSeatTiltValue: " .. passengerSeatTiltValue)
		-- passengerSeatTilt = electrics.values.passengerSeatTilt
		-- print("passengerSeatTilt: " .. passengerSeatTilt)

	-- seat tilt move
	if passengerSeatTiltValue == 1 then
		playSeatSound()
		electrics.values["passengerSeatTilt"] = electrics.values["passengerSeatTilt"] - 0.005
	elseif passengerSeatTiltValue == -1 then
		playSeatSound()
		electrics.values["passengerSeatTilt"] = electrics.values["passengerSeatTilt"] + 0.005
	end

	if electrics.values.passengerSeatTilt > 0.5 then
		electrics.values["passengerSeatTilt"] = 0.5
		if upperDriverSeatTiltValue == -1 or lowerDriverSeatTiltValue == -1 or driverSeatTiltValue == -1 or driverSeatValue == -1 or upperPassengerSeatTiltValue == -1 or lowerPassengerSeatTiltValue == -1 or passengerSeatTiltValue == -1 or passengerSeatValue == -1 then
			stopSeatSound()
		end
	elseif electrics.values.passengerSeatTilt < 0 then
		electrics.values["passengerSeatTilt"] = 0
		if upperDriverSeatTiltValue == 1 or lowerDriverSeatTiltValue == 1 or driverSeatTiltValue == 1 or driverSeatValue == 1 or upperPassengerSeatTiltValue == 1 or lowerPassengerSeatTiltValue == 1 or passengerSeatTiltValue == 1 or passengerSeatValue == 1 then
			stopSeatSound()
		end
	end

	-- seat move debug
		-- print("passengerSeatValue: " .. passengerSeatValue)
		-- passengerSeat = electrics.values.passengerSeat
		-- print("passengerSeat: " .. passengerSeat)

	-- seat move move
	if passengerSeatValue == 1 then
		playSeatSound()
		electrics.values["passengerSeat"] = electrics.values["passengerSeat"] - 0.0025
	elseif passengerSeatValue == -1 then
		playSeatSound()
		electrics.values["passengerSeat"] = electrics.values["passengerSeat"] + 0.0025
	end

	if electrics.values.passengerSeat > 1 then
		electrics.values["passengerSeat"] = 1
		if upperDriverSeatTiltValue == -1 or lowerDriverSeatTiltValue == -1 or driverSeatTiltValue == -1 or driverSeatValue == -1 or upperPassengerSeatTiltValue == -1 or lowerPassengerSeatTiltValue == -1 or passengerSeatTiltValue == -1 or passengerSeatValue == -1 then
			stopSeatSound()
		end
	elseif electrics.values.passengerSeat < -1 then
		electrics.values["passengerSeat"] = -1
		if upperDriverSeatTiltValue == 1 or lowerDriverSeatTiltValue == 1 or driverSeatTiltValue == 1 or driverSeatValue == 1 or upperPassengerSeatTiltValue == 1 or lowerPassengerSeatTiltValue == 1 or passengerSeatTiltValue == 1 or passengerSeatValue == 1 then
			stopSeatSound()
		end
	end


	--[[
	================================================================================================================================
															WINDOWS
	================================================================================================================================
	]]--
	
	if windowFLValue == 0 and windowFLAutoValue == 0 and windowFRValue == 0 and windowFRAutoValue == 0 and windowRLValue == 0 and windowRLAutoValue == 0 and windowRRValue == 0 and windowRRAutoValue == 0 and sunroofValue == 0 and sunroofAutoValue == 0 then
		stopWindowSound()
	end

	-- FL window move debug
		-- print("windowFLValue: " .. windowFLValue)
		-- print("windowFLAutoValue: " .. windowFLAutoValue)
		-- windowFL = electrics.values.windowFL
		-- print("windowFL: " .. windowFL)

	-- FL window move move
	if windowFLValue == 1 then
		playWindowSound()
		windowFLAutoValue = 0
		electrics.values["windowFL"] = electrics.values["windowFL"] - 0.005
	elseif windowFLValue == -1 then
		playWindowSound()
		windowFLAutoValue = 0
		electrics.values["windowFL"] = electrics.values["windowFL"] + 0.005
	end

	-- FL window auto move move
	if windowFLAutoValue == 1 then
		playWindowSound()
		electrics.values["windowFL"] = electrics.values["windowFL"] - 0.005
	elseif windowFLAutoValue == -1 then
		playWindowSound()
		electrics.values["windowFL"] = electrics.values["windowFL"] + 0.005
	end

	-- Sound and Limits
	if playerInfo.firstPlayerSeated and electrics.values.windowFL > 0 then
		obj:queueGameEngineLua(string.format("core_sounds.cabinFilterStrength = %f", 0))
	end
	if electrics.values.windowFL > 0.68 then
		electrics.values["windowFL"] = 0.67
		if windowFLValue == -1 or windowFLAutoValue == -1 or windowFRValue == -1 or windowFRAutoValue == -1 or windowRLValue == -1 or windowRLAutoValue == -1 or windowRRValue == -1 or windowRRAutoValue == -1 or sunroofValue == -1 or sunroofAutoValue == -1 then
			if windowFLAutoValue ~= -1 and windowFRAutoValue ~= -1 and windowRLAutoValue ~= -1 and windowRRAutoValue ~= -1 and sunroofAutoValue ~= -1 then
				stopWindowSound()
			end
		end
		windowFLAutoValue = 0
	elseif electrics.values.windowFL < 0 then
		electrics.values["windowFL"] = 0
		windowFLAutoValue = 0
		if playerInfo.firstPlayerSeated then
			obj:queueGameEngineLua(string.format("core_sounds.cabinFilterStrength = %f", 1))
		end
		if windowFLValue == 1 or windowFLAutoValue == 1 or windowFRValue == 1 or windowFRAutoValue == 1 or windowRLValue == 1 or windowRLAutoValue == 1 or windowRRValue == 1 or windowRRAutoValue == 1 or sunroofValue == 1 or sunroofAutoValue == 1 then
			if windowFLAutoValue ~= 1 and windowFRAutoValue ~= 1 and windowRLAutoValue ~= 1 and windowRRAutoValue ~= 1 and sunroofAutoValue ~= 1 then
				stopWindowSound()
			end
		end
	end

	-- FR window move debug
		-- print("windowFRValue: " .. windowFRValue)
		-- print("windowFRAutoValue: " .. windowFRAutoValue)
		-- windowFR = electrics.values.windowFR
		-- print("windowFR: " .. windowFR)

	-- FR window move move
	if windowFRValue == 1 then
		playWindowSound()
		windowFRAutoValue = 0
		electrics.values["windowFR"] = electrics.values["windowFR"] - 0.005
	elseif windowFRValue == -1 then
		playWindowSound()
		windowFRAutoValue = 0
		electrics.values["windowFR"] = electrics.values["windowFR"] + 0.005
	end

	-- FR window auto move move
	if windowFRAutoValue == 1 then
		playWindowSound()
		electrics.values["windowFR"] = electrics.values["windowFR"] - 0.005
	elseif windowFRAutoValue == -1 then
		playWindowSound()
		electrics.values["windowFR"] = electrics.values["windowFR"] + 0.005
	end

	-- Sound and Limits
	if playerInfo.firstPlayerSeated and electrics.values.windowFR > 0 then
		obj:queueGameEngineLua(string.format("core_sounds.cabinFilterStrength = %f", 0))
	end
	if electrics.values.windowFR > 0.68 then
		electrics.values["windowFR"] = 0.67
		if windowFLValue == -1 or windowFLAutoValue == -1 or windowFRValue == -1 or windowFRAutoValue == -1 or windowRLValue == -1 or windowRLAutoValue == -1 or windowRRValue == -1 or windowRRAutoValue == -1 or sunroofValue == -1 or sunroofAutoValue == -1 then
			if windowFLAutoValue ~= -1 and windowFRAutoValue ~= -1 and windowRLAutoValue ~= -1 and windowRRAutoValue ~= -1 and sunroofAutoValue ~= -1 then
				stopWindowSound()
			end
		end
		windowFRAutoValue = 0
	elseif electrics.values.windowFR < 0 then
		electrics.values["windowFR"] = 0
		windowFRAutoValue = 0
		if playerInfo.firstPlayerSeated then
			obj:queueGameEngineLua(string.format("core_sounds.cabinFilterStrength = %f", 1))
		end
		if windowFLValue == 1 or windowFLAutoValue == 1 or windowFRValue == 1 or windowFRAutoValue == 1 or windowRLValue == 1 or windowRLAutoValue == 1 or windowRRValue == 1 or windowRRAutoValue == 1 or sunroofValue == 1 or sunroofAutoValue == 1 then
			if windowFLAutoValue ~= 1 and windowFRAutoValue ~= 1 and windowRLAutoValue ~= 1 and windowRRAutoValue ~= 1 and sunroofAutoValue ~= 1 then
				stopWindowSound()
			end
		end
	end

	-- RL window move debug
		-- print("windowRLValue: " .. windowRLValue)
		-- print("windowRLAutoValue: " .. windowRLAutoValue)
		-- windowRL = electrics.values.windowRL
		-- print("windowRL: " .. windowRL)

	-- RL window move move
	if windowRLValue == 1 then
		playWindowSound()
		windowRLAutoValue = 0
		electrics.values["windowRL"] = electrics.values["windowRL"] - 0.005
	elseif windowRLValue == -1 then
		playWindowSound()
		windowRLAutoValue = 0
		electrics.values["windowRL"] = electrics.values["windowRL"] + 0.005
	end

	-- RL window auto move move
	if windowRLAutoValue == 1 then
		playWindowSound()
		electrics.values["windowRL"] = electrics.values["windowRL"] - 0.005
	elseif windowRLAutoValue == -1 then
		playWindowSound()
		electrics.values["windowRL"] = electrics.values["windowRL"] + 0.005
	end

	-- Sound and Limits
	if playerInfo.firstPlayerSeated and electrics.values.windowRL > 0 then
		obj:queueGameEngineLua(string.format("core_sounds.cabinFilterStrength = %f", 0))
	end
	if electrics.values.windowRL > 0.68 then
		electrics.values["windowRL"] = 0.67
		if windowFLValue == -1 or windowFLAutoValue == -1 or windowFRValue == -1 or windowFRAutoValue == -1 or windowRLValue == -1 or windowRLAutoValue == -1 or windowRRValue == -1 or windowRRAutoValue == -1 or sunroofValue == -1 or sunroofAutoValue == -1 then
			if windowFLAutoValue ~= -1 and windowFRAutoValue ~= -1 and windowRLAutoValue ~= -1 and windowRRAutoValue ~= -1 and sunroofAutoValue ~= -1 then
				stopWindowSound()
			end
		end
		windowRLAutoValue = 0
	elseif electrics.values.windowRL < 0 then
		electrics.values["windowRL"] = 0
		windowRLAutoValue = 0
		if playerInfo.firstPlayerSeated then
			obj:queueGameEngineLua(string.format("core_sounds.cabinFilterStrength = %f", 1))
		end
		if windowFLValue == 1 or windowFLAutoValue == 1 or windowFRValue == 1 or windowFRAutoValue == 1 or windowRLValue == 1 or windowRLAutoValue == 1 or windowRRValue == 1 or windowRRAutoValue == 1 or sunroofValue == 1 or sunroofAutoValue == 1 then
			if windowFLAutoValue ~= 1 and windowFRAutoValue ~= 1 and windowRLAutoValue ~= 1 and windowRRAutoValue ~= 1 and sunroofAutoValue ~= 1 then
				stopWindowSound()
			end
		end
	end

	-- RR window move debug
		-- print("windowRRValue: " .. windowRRValue)
		-- print("windowRRAutoValue: " .. windowRRAutoValue)
		-- windowRR = electrics.values.windowRR
		-- print("windowRR: " .. windowRR)

	-- RR window move move
	if windowRRValue == 1 then
		playWindowSound()
		windowRRAutoValue = 0
		electrics.values["windowRR"] = electrics.values["windowRR"] - 0.005
	elseif windowRRValue == -1 then
		playWindowSound()
		windowRRAutoValue = 0
		electrics.values["windowRR"] = electrics.values["windowRR"] + 0.005
	end

	-- RR window auto move move
	if windowRRAutoValue == 1 then
		playWindowSound()
		electrics.values["windowRR"] = electrics.values["windowRR"] - 0.005
	elseif windowRRAutoValue == -1 then
		playWindowSound()
		electrics.values["windowRR"] = electrics.values["windowRR"] + 0.005
	end

	-- Sound and Limits
	if playerInfo.firstPlayerSeated and electrics.values.windowRR > 0 then
		obj:queueGameEngineLua(string.format("core_sounds.cabinFilterStrength = %f", 0))
	end
	if electrics.values.windowRR > 0.68 then
		electrics.values["windowRR"] = 0.67
		if windowFLValue == -1 or windowFLAutoValue == -1 or windowFRValue == -1 or windowFRAutoValue == -1 or windowRLValue == -1 or windowRLAutoValue == -1 or windowRRValue == -1 or windowRRAutoValue == -1 or sunroofValue == -1 or sunroofAutoValue == -1 then
			if windowFLAutoValue ~= -1 and windowFRAutoValue ~= -1 and windowRLAutoValue ~= -1 and windowRRAutoValue ~= -1 and sunroofAutoValue ~= -1 then
				stopWindowSound()
			end
		end
		windowRRAutoValue = 0
	elseif electrics.values.windowRR < 0 then
		electrics.values["windowRR"] = 0
		windowRRAutoValue = 0
		if playerInfo.firstPlayerSeated then
			obj:queueGameEngineLua(string.format("core_sounds.cabinFilterStrength = %f", 1))
		end
		if windowFLValue == 1 or windowFLAutoValue == 1 or windowFRValue == 1 or windowFRAutoValue == 1 or windowRLValue == 1 or windowRLAutoValue == 1 or windowRRValue == 1 or windowRRAutoValue == 1 or sunroofValue == 1 or sunroofAutoValue == 1 then
			if windowFLAutoValue ~= 1 and windowFRAutoValue ~= 1 and windowRLAutoValue ~= 1 and windowRRAutoValue ~= 1 and sunroofAutoValue ~= 1 then
				stopWindowSound()
			end
		end
	end

	-- Sunroof move debug
		-- print("sunroofValue: " .. sunroofValue)
		-- print("sunroofAutoValue: " .. sunroofAutoValue)
		-- sunroof = electrics.values.windowSRT
		-- print("sunroof: " .. sunroof)

	-- Sunroof move move
	if sunroofValue == 1 then
		playWindowSound()
		sunroofAutoValue = 0
		electrics.values["windowSRT"] = electrics.values["windowSRT"] - 0.01
	elseif sunroofValue == -1 then
		playWindowSound()
		sunroofAutoValue = 0
		electrics.values["windowSRT"] = electrics.values["windowSRT"] + 0.01
	end

	-- Sunroof auto move move
	if sunroofAutoValue == 1 then
		playWindowSound()
		electrics.values["windowSR"] = electrics.values["windowSR"] - 0.005
	elseif sunroofAutoValue == -1 then
		playWindowSound()
		electrics.values["windowSR"] = electrics.values["windowSR"] + 0.005
	end

	-- Sound and Limits
	if playerInfo.firstPlayerSeated and electrics.values.windowSRT > 0 then
		obj:queueGameEngineLua(string.format("core_sounds.cabinFilterStrength = %f", 0))
	end
	if electrics.values.windowSRT > 1 then
		electrics.values["windowSRT"] = 0.99
		if windowFLValue == -1 or windowFLAutoValue == -1 or windowFRValue == -1 or windowFRAutoValue == -1 or windowRLValue == -1 or windowRLAutoValue == -1 or windowRRValue == -1 or windowRRAutoValue == -1 or sunroofValue == -1 or sunroofAutoValue == -1 then
			if windowFLAutoValue ~= -1 and windowFRAutoValue ~= -1 and windowRLAutoValue ~= -1 and windowRRAutoValue ~= -1 and sunroofAutoValue ~= -1 then
				stopWindowSound()
			end
		end
		sunroofAutoValue = 0
	elseif electrics.values.windowSRT < 0 then
		electrics.values["windowSRT"] = 0
		sunroofAutoValue = 0
		if playerInfo.firstPlayerSeated then
			obj:queueGameEngineLua(string.format("core_sounds.cabinFilterStrength = %f", 1))
		end
		if windowFLValue == 1 or windowFLAutoValue == 1 or windowFRValue == 1 or windowFRAutoValue == 1 or windowRLValue == 1 or windowRLAutoValue == 1 or windowRRValue == 1 or windowRRAutoValue == 1 or sunroofValue == 1 or sunroofAutoValue == 1 then
			if windowFLAutoValue ~= 1 and windowFRAutoValue ~= 1 and windowRLAutoValue ~= 1 and windowRRAutoValue ~= 1 and sunroofAutoValue ~= 1 then
				stopWindowSound()
			end
		end
	end

	-- Sound and Limits
	if playerInfo.firstPlayerSeated and electrics.values.windowSR > 0 then
		obj:queueGameEngineLua(string.format("core_sounds.cabinFilterStrength = %f", 0))
	end
	if electrics.values.windowSR > 1 then
		electrics.values["windowSR"] = 0.99
		if windowFLValue == -1 or windowFLAutoValue == -1 or windowFRValue == -1 or windowFRAutoValue == -1 or windowRLValue == -1 or windowRLAutoValue == -1 or windowRRValue == -1 or windowRRAutoValue == -1 or sunroofValue == -1 or sunroofAutoValue == -1 then
			if windowFLAutoValue ~= -1 and windowFRAutoValue ~= -1 and windowRLAutoValue ~= -1 and windowRRAutoValue ~= -1 and sunroofAutoValue ~= -1 then
				stopWindowSound()
			end
		end
		sunroofAutoValue = 0
	elseif electrics.values.windowSR < 0 then
		electrics.values["windowSR"] = 0
		sunroofAutoValue = 0
		if playerInfo.firstPlayerSeated then
			obj:queueGameEngineLua(string.format("core_sounds.cabinFilterStrength = %f", 1))
		end
		if windowFLValue == 1 or windowFLAutoValue == 1 or windowFRValue == 1 or windowFRAutoValue == 1 or windowRLValue == 1 or windowRLAutoValue == 1 or windowRRValue == 1 or windowRRAutoValue == 1 or sunroofValue == 1 or sunroofAutoValue == 1 then
			if windowFLAutoValue ~= 1 and windowFRAutoValue ~= 1 and windowRLAutoValue ~= 1 and windowRRAutoValue ~= 1 and sunroofAutoValue ~= 1 then
				stopWindowSound()
			end
		end
	end

	--[[
	================================================================================================================================
															NAV
	================================================================================================================================
	]]--

	-- nav move
	if electrics.values.toggleNav == 1 then
		electrics.values["nav"] = electrics.values["nav"] + 0.01
	elseif electrics.values.toggleNav == 0 then
		electrics.values["nav"] = electrics.values["nav"] - 0.01
	end

	if electrics.values.nav >= 1 then
		electrics.values["nav"] = 1
	elseif electrics.values.nav < 0 then
		electrics.values["nav"] = 0
	end
	
end

-- public interface
M.init = init
M.onReset = onReset
M.updateGFX = updateGFX
M.columnMoveUp = columnMoveUp
M.columnMoveDown = columnMoveDown
M.upperDriverSeatTiltForward = upperDriverSeatTiltForward
M.upperDriverSeatTiltBack = upperDriverSeatTiltBack
M.lowerDriverSeatTiltUp = lowerDriverSeatTiltUp
M.lowerDriverSeatTiltDown = lowerDriverSeatTiltDown
M.driverSeatTiltUp = driverSeatTiltUp
M.driverSeatTiltDown = driverSeatTiltDown
M.upperPassengerSeatTiltForward = upperPassengerSeatTiltForward
M.upperPassengerSeatTiltBack = upperPassengerSeatTiltBack
M.lowerPassengerSeatTiltUp = lowerPassengerSeatTiltUp
M.lowerPassengerSeatTiltDown = lowerPassengerSeatTiltDown
M.passengerSeatTiltUp = passengerSeatTiltUp
M.passengerSeatTiltDown = passengerSeatTiltDown
M.driverSeatF = driverSeatF
M.driverSeatR = driverSeatR
M.passengerSeatF = passengerSeatF
M.passengerSeatR = passengerSeatR
M.toggleAC = toggleAC
M.windowFLUp = windowFLUp
M.windowFLDown = windowFLDown
M.windowFRUp = windowFRUp
M.windowFRDown = windowFRDown
M.windowRLUp = windowRLUp
M.windowRLDown = windowRLDown
M.windowRRUp = windowRRUp
M.windowRRDown = windowRRDown
M.sunroofUp = sunroofUp
M.sunroofDown = sunroofDown
M.windowFLAutoUp = windowFLAutoUp
M.windowFLAutoDown = windowFLAutoDown
M.windowFRAutoUp = windowFRAutoUp
M.windowFRAutoDown = windowFRAutoDown
M.windowRLAutoUp = windowRLAutoUp
M.windowRLAutoDown = windowRLAutoDown
M.windowRRAutoUp = windowRRAutoUp
M.windowRRAutoDown = windowRRAutoDown
M.sunroofAutoUp = sunroofAutoUp
M.sunroofAutoDown = sunroofAutoDown
M.toggleNav = toggleNav
M.setCameraInside = setCameraInside
M.domeLightF = domeLightF
M.domeLightR = domeLightR
M.wiperToggle = wiperToggle
M.checkLockFileAndDelete = checkLockFileAndDelete

return M
